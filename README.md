# Vow V2

The project is packaged as a real protocol surface, not a placeholder page: the contract stores records, exposes read models and records smoke-tested writes.

A GenLayer accountability protocol.

## Vow Brief

This repo is organized for review: the app can be opened locally, the contract source is present, and the deployed Studionet address is pinned in `deployment.json`.

- Folder: `projects/25-vow`
- Frontend shape: static browser app
- Contract source: `contracts/vow_v2.py`
- Build status: Schema-valid (35986 bytes, 14 write + 21 view); deployed + 15 write smoke txs finalized incl 3 GenLayer reasoning calls; 35/35 read tests passed; legacy frontend shape verified; app.js repointed.

## Protocol Mechanics

Vow V2 (# v0.2.16), 35986 bytes, 14 write + 21 view.

- Primary source: `contracts/vow_v2.py` (35,986 bytes)
- Public write/action methods: 15
- Read methods: 19
- GenLayer features: live web rendering, LLM adjudication, validator-comparative consensus, append-only collections

Typical flow: `open_review` -> `submit_challenge` -> `review_vow_with_genlayer` -> `resolve` -> `open_challenge_window` -> `submit_appeal` -> `archive_vow`

Useful reads: `get_vow_count`, `get_stats`, `get_vow`, `get_vow_record`, `get_recent_vows`, `get_vows_by_status`, `get_author_vows`, `get_milestones`

## Vow On Studionet

- Network: studionet (61999)
- Contract: [0x594A3e1d78ac366DF47cE61b290209c5262ba2A0](https://explorer-studio.genlayer.com/contracts/0x594A3e1d78ac366DF47cE61b290209c5262ba2A0)
- Deploy tx: [0x8f101325...baeebf](https://explorer-studio.genlayer.com/tx/0x8f101325d7d3d1e230cf271815761f2486e1aa1df7ec64560c0d21356ebaeebf)
- Deployed at: 2026-06-23T19:21:36.223Z
- Smoke writes recorded: 15

Smoke coverage:

- set_vow_standard: [0x52b694ac...2ccb37](https://explorer-studio.genlayer.com/tx/0x52b694ac9749598a76ffbe510fdcdb2767287d021b3533a9af5d06f2ea2ccb37)
- draft_vow: [0xad052ef4...d353d5](https://explorer-studio.genlayer.com/tx/0xad052ef48ba5eee6c2df78b25bf87f6d91261a909ee99b6add7b84bdbad353d5)
- add_milestone: [0x7c8870ce...19747e](https://explorer-studio.genlayer.com/tx/0x7c8870ce210338e9442f4f9efddf5a48c003e0cef8059cb113c9c4ae2519747e)
- add_evidence_docs: [0x8d290634...f73ee7](https://explorer-studio.genlayer.com/tx/0x8d290634678745ec6076c57a7705a036b83f8ff6b76d8902ea1ff06ea9f73ee7)
- add_evidence_releases: [0x95bda3d3...60c8fc](https://explorer-studio.genlayer.com/tx/0x95bda3d3e2a5ff7118647ce18c1e7aca3fae34c35e05a5314797100dc860c8fc)
- open_review: [0xae313d18...6f606c](https://explorer-studio.genlayer.com/tx/0xae313d18ddcdebe2afd71bf5740dce64fb699747460d01b1809e3d32486f606c)

## Operator Preview

```powershell
cd <private-workspace-root>
npm run preview:start
npm run preview:project -- 25-vow
```

Open http://localhost:8080/25-vow/.

## Release Command

```powershell
cd <private-workspace-root>
npm run publish:project -- -Project 25-vow -Repo https://github.com/aspro45/<repo-name>.git
```

## Public Repo Safety

The repo is designed for public GitHub/Vercel release. Keep `.env`, `.vercel/`, wallet vaults, private keys and local dashboard state out of git. The publisher script enforces these ignore rules before it pushes.
