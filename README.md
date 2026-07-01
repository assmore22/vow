# Vow

Public commitments with evidence-based completion checks.

Vow tracks promises that need proof. A commitment can be opened, supported with source evidence and reviewed by GenLayer before it is marked fulfilled or disputed.

## Review Links

| Surface | Link |
| --- | --- |
| Live app | https://assmore22-vow.vercel.app |
| GitHub | https://github.com/assmore22/vow |
| Contract | https://explorer-studio.genlayer.com/contracts/0x594A3e1d78ac366DF47cE61b290209c5262ba2A0 |

## Chain Record

- Network: GenLayer Studionet
- Chain ID: 61999
- Contract: `0x594A3e1d78ac366DF47cE61b290209c5262ba2A0`
- Deploy transaction: [0x8f101325...baeebf](https://explorer-studio.genlayer.com/tx/0x8f101325d7d3d1e230cf271815761f2486e1aa1df7ec64560c0d21356ebaeebf)
- Deployed: `2026-06-23T19:21:36.223Z`
- Source: `contracts/vow_v2.py` (35,986 bytes)

## Protocol Path

1. Create a vow.
2. Attach obligations.
3. Submit completion evidence.
4. Review with validators.
5. Resolve challenge or archive.

The frontend reads vow records, party views, evidence, challenge windows and reputation data. Contract state is public; write actions still require a connected wallet on GenLayer Studionet.

## Finalized Smoke

| Action | Transaction |
| --- | --- |
| `set_vow_standard` | [0x52b694ac...2ccb37](https://explorer-studio.genlayer.com/tx/0x52b694ac9749598a76ffbe510fdcdb2767287d021b3533a9af5d06f2ea2ccb37) |
| `draft_vow` | [0xad052ef4...d353d5](https://explorer-studio.genlayer.com/tx/0xad052ef48ba5eee6c2df78b25bf87f6d91261a909ee99b6add7b84bdbad353d5) |
| `add_milestone` | [0x7c8870ce...19747e](https://explorer-studio.genlayer.com/tx/0x7c8870ce210338e9442f4f9efddf5a48c003e0cef8059cb113c9c4ae2519747e) |
| `add_evidence_docs` | [0x8d290634...f73ee7](https://explorer-studio.genlayer.com/tx/0x8d290634678745ec6076c57a7705a036b83f8ff6b76d8902ea1ff06ea9f73ee7) |
| `add_evidence_releases` | [0x95bda3d3...60c8fc](https://explorer-studio.genlayer.com/tx/0x95bda3d3e2a5ff7118647ce18c1e7aca3fae34c35e05a5314797100dc860c8fc) |
| `open_review` | [0xae313d18...6f606c](https://explorer-studio.genlayer.com/tx/0xae313d18ddcdebe2afd71bf5740dce64fb699747460d01b1809e3d32486f606c) |

## Local Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Release Hygiene

The public package is static and has no install step. Vercel receives only frontend, contract source and public deployment metadata.

Keep wallet private keys, vault exports, `.env` files, Vercel project state and dashboard data out of Git. This repository is for public source, UI, tests and deployment receipts only.
