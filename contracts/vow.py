# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""
VOW - Accountability Contracts, Verified by AI
==============================================
Put your word on-chain. You make a public commitment and lock a stake. When it
is time to settle, the contract reads the proof you linked and a validator set
decides (Equivalence Principle) whether you actually followed through.
  - Kept   -> your stake comes back to you.
  - Broken -> your stake goes to the beneficiary you named when you made the vow.
No referee, no trust required: the outcome is decided by reading the evidence.

Status: ACTIVE(0) -> KEPT(1) | BROKEN(2)
"""

from genlayer import *
from dataclasses import dataclass
import json
import typing


ACTIVE = 0
KEPT = 1
BROKEN = 2


@allow_storage
@dataclass
class Commitment:
    author: Address
    beneficiary: Address
    title: str
    detail: str
    proof_url: str
    stake: u256
    status: u8
    rationale: str


class Vow(gl.Contract):
    vows: DynArray[Commitment]

    def __init__(self) -> None:
        pass

    @gl.public.write.payable
    def make_vow(self, title: str, detail: str, proof_url: str, beneficiary: str) -> int:
        if len(title.strip()) == 0:
            raise gl.vm.UserError("a title is required")
        if len(detail.strip()) == 0:
            raise gl.vm.UserError("describe what you are committing to")
        if len(proof_url.strip()) == 0:
            raise gl.vm.UserError("a proof URL is required")
        if gl.message.value == 0:
            raise gl.vm.UserError("you must lock a stake")
        try:
            ben = Address(beneficiary)
        except Exception:
            raise gl.vm.UserError("a valid beneficiary address is required")
        v = self.vows.append_new_get()
        v.author = gl.message.sender_address
        v.beneficiary = ben
        v.title = title
        v.detail = detail
        v.proof_url = proof_url
        v.stake = gl.message.value
        v.status = u8(ACTIVE)
        v.rationale = ""
        return len(self.vows) - 1

    @gl.public.write
    def resolve(self, vow_id: int) -> None:
        """Read the proof; validators decide whether the vow was kept."""
        v = self._get(vow_id)
        if v.status != ACTIVE:
            raise gl.vm.UserError("this vow is already settled")

        title = v.title
        detail = v.detail
        url = v.proof_url

        def leader_fn() -> str:
            page = ""
            try:
                page = gl.nondet.web.get(url).body.decode("utf-8")[:6000]
            except Exception:
                page = "(proof page unreachable)"
            prompt = (
                f"Someone made a public commitment and staked money on keeping it.\n"
                f"Commitment: {title}\n"
                f"Details: {detail}\n\n"
                f"Evidence page they linked as proof:\n{page}\n\n"
                "Judge strictly on the evidence. Did they actually fulfil the "
                'commitment? Reply with ONLY JSON: {"fulfilled": true} if the proof '
                'clearly shows it was done, {"fulfilled": false} otherwise, plus a '
                'short "reason".'
            )
            return gl.nondet.exec_prompt(prompt)

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            return self._decision_of(leader_res.calldata)[0] == self._decision_of(leader_fn())[0]

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        kept, reason = self._decision_of(result)
        v.rationale = reason[:300]
        if kept:
            v.status = u8(KEPT)
            self._pay(v.author, v.stake)
        else:
            v.status = u8(BROKEN)
            self._pay(v.beneficiary, v.stake)

    # ------------------------------------------------------------------ views
    @gl.public.view
    def get_vow_count(self) -> int:
        return len(self.vows)

    @gl.public.view
    def get_stats(self) -> dict:
        kept = 0
        broken = 0
        active = 0
        staked = 0
        for v in self.vows:
            if v.status == KEPT:
                kept += 1
            elif v.status == BROKEN:
                broken += 1
            else:
                active += 1
                staked += int(v.stake)
        return {"total": len(self.vows), "kept": kept, "broken": broken, "active": active, "staked_active": str(staked)}

    @gl.public.view
    def get_vow(self, vow_id: int) -> dict:
        v = self._get(vow_id)
        return {
            "author": v.author.as_hex,
            "beneficiary": v.beneficiary.as_hex,
            "title": v.title,
            "detail": v.detail,
            "proof_url": v.proof_url,
            "stake": str(v.stake),
            "status": int(v.status),
            "rationale": v.rationale,
        }

    # -------------------------------------------------------------- internals
    def _get(self, vow_id: int) -> Commitment:
        if vow_id < 0 or vow_id >= len(self.vows):
            raise gl.vm.UserError("no such vow")
        return self.vows[vow_id]

    def _decision_of(self, result: typing.Any) -> tuple:
        data = result
        if isinstance(data, str):
            data = self._extract_json(data)
        if not isinstance(data, dict):
            return (False, "")
        raw = data.get("fulfilled", None)
        reason = str(data.get("reason", ""))
        if isinstance(raw, bool):
            return (raw, reason)
        if isinstance(raw, str):
            return (raw.strip().lower() == "true", reason)
        return (False, reason)

    def _extract_json(self, text: str) -> typing.Any:
        try:
            return json.loads(text)
        except (ValueError, TypeError):
            pass
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except (ValueError, TypeError):
                return None
        return None

    def _pay(self, recipient: Address, amount: u256) -> None:
        if amount == u256(0):
            return
        _Payee(recipient).emit_transfer(value=amount)


@gl.evm.contract_interface
class _Payee:
    class View:
        pass

    class Write:
        pass
