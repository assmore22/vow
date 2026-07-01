"""Tests for VOW (direct runner). AI resolve() validated live on studionet."""
from pathlib import Path

CONTRACT = str(Path(__file__).resolve().parents[1] / "contracts" / "vow.py")
GEN = 10 ** 18
ACTIVE = 0; KEPT = 1; BROKEN = 2
BEN = "0x431ACf85256AFcb3A8c66aff96b923366D5DdaC2"


def _vow(v, vm, who, title="Ship the open-source release", detail="Publish v1.0 on the public repo",
         url="https://example.com", ben=BEN, stake=2):
    vm.sender = who
    vm.value = stake * GEN
    out = v.make_vow(title, detail, url, ben)
    vm.value = 0
    return out


def test_make_vow(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    vid = _vow(v, direct_vm, direct_alice)
    assert vid == 0
    d = v.get_vow(0)
    assert d["status"] == ACTIVE
    assert int(d["stake"]) == 2 * GEN
    assert d["beneficiary"].lower() == BEN.lower()


def test_requires_stake(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    direct_vm.sender = direct_alice
    direct_vm.value = 0
    with direct_vm.expect_revert("must lock a stake"):
        v.make_vow("t", "d", "https://x.com", BEN)


def test_requires_title(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    direct_vm.sender = direct_alice
    direct_vm.value = GEN
    with direct_vm.expect_revert("a title is required"):
        v.make_vow("", "d", "https://x.com", BEN)
    direct_vm.value = 0


def test_requires_proof(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    direct_vm.sender = direct_alice
    direct_vm.value = GEN
    with direct_vm.expect_revert("a proof URL is required"):
        v.make_vow("t", "d", "", BEN)
    direct_vm.value = 0


def test_bad_beneficiary(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    direct_vm.sender = direct_alice
    direct_vm.value = GEN
    with direct_vm.expect_revert():
        v.make_vow("t", "d", "https://x.com", "not-an-address")
    direct_vm.value = 0


def test_stats(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    _vow(v, direct_vm, direct_alice, title="A")
    _vow(v, direct_vm, direct_alice, title="B", stake=3)
    s = v.get_stats()
    assert s["total"] == 2
    assert s["active"] == 2
    assert int(s["staked_active"]) == 5 * GEN


def test_resolve_requires_active(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    _vow(v, direct_vm, direct_alice)
    with direct_vm.expect_revert("no such vow"):
        v.resolve(7)


def test_multiple(deploy, direct_vm, direct_alice):
    v = deploy(CONTRACT)
    _vow(v, direct_vm, direct_alice, title="One")
    _vow(v, direct_vm, direct_alice, title="Two")
    assert v.get_vow_count() == 2
    assert v.get_vow(1)["title"] == "Two"
