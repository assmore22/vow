# Vow

Public commitments with evidence-based completion checks.

Vow tracks promises that need proof. A commitment can be opened, supported with source evidence and reviewed by GenLayer before it is marked fulfilled or disputed.

## Review Links

| Surface | Link |
| --- | --- |
| Live app | https://assmore22-vow.vercel.app |
| GitHub | https://github.com/assmore22/vow |
| Contract | https://explorer-bradbury.genlayer.com/address/0xe48B45Ee02D755B96a63Bc790E5746ab9b24B9a3 |

## Chain Record

- Network: GenLayer Bradbury
- Chain ID: 4221
- Contract: `0xe48B45Ee02D755B96a63Bc790E5746ab9b24B9a3`
- Deploy transaction: [0x3e536bb4...ed24f4](https://explorer-bradbury.genlayer.com/tx/0x3e536bb4438f948756657e907109a5b970baea03cc1bd44d5a50c1f7abed24f4)
- Deployed: `2026-07-01T15:50:50.224Z`
- Source: `contracts/vow_v2.py` (35,986 bytes)

## Protocol Path

1. Create a vow.
2. Attach obligations.
3. Submit completion evidence.
4. Review with validators.
5. Resolve challenge or archive.

The frontend reads vow records, party views, evidence, challenge windows and reputation data. Contract state is public; write actions still require a connected wallet on GenLayer Bradbury.

## Bradbury Smoke

| Action | Transaction |
| --- | --- |
| `make_vow + set_vow_standard` | [0x5588b234...201546](https://explorer-bradbury.genlayer.com/tx/0x5588b2344451ee55e25dad5dfb00831e7849c05f23fd7a08fa461b7379201546) |
| `secondary write` | [0xcf010fc8...244406](https://explorer-bradbury.genlayer.com/tx/0xcf010fc854bfa2b5067c27a7b72b19bc96f785c2219ed192dc225bf73a244406) |

Read verification passed on Bradbury after deploy. The public app points at this contract address and reads accepted state.

## Local Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Release Hygiene

The public package is static and has no install step. Vercel receives only frontend, contract source and public deployment metadata.

Keep wallet private keys, vault exports, `.env` files, Vercel project state and dashboard data out of Git. This repository is for public source, UI, tests and deployment receipts only.
