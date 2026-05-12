# CKB Actions Marketplace

An on-chain task board built on [Nervos CKB](https://docs.nervos.org). Post tasks with CKB rewards locked in cells. Workers claim, complete, and get paid atomically — no platform holds funds at any point.

Live on CKB testnet.

## How It Works

Every task is a CKB cell. The reward is locked inside it from the moment the task is posted. Two scripts govern what can happen to that cell:

- **task-lock** — controls who can spend the cell based on its current status
- **task-type** — enforces the state machine, validating every transition

```
open → claimed → submitted → completed
                           ↘ disputed
```

No backend. No database. The chain is the state.

## Task Lifecycle

| Step | Who | What happens on-chain |
|------|-----|-----------------------|
| Post | Poster | Task cell created, reward locked inside |
| Claim | Worker | Cell updated: status → claimed, worker lock hash written |
| Submit | Worker | Cell updated: status → submitted |
| Approve | Reviewer | Cell updated: status → completed, reward claimable by worker |
| Reject | Reviewer | Cell updated: status → disputed |
| Cancel | Poster | Cell consumed, CKB returned to poster (open tasks only) |

## Project Structure

```
contracts/
  task-type/src/main.rs   # State machine — validates every transition
  task-lock/src/main.rs   # Spending rules — who can unlock based on status
tests/src/tests.rs        # 8 test cases covering all transitions
deployment/               # Deployment config and migration files
frontend/                 # Next.js app
  app/                    # Pages: browse, post, task detail, dashboard
  components/             # Navbar, TaskCard, StatusBadge, StatsBar
  lib/                    # codec, indexer, transactions, scripts config
  hooks/                  # useTasks, useTask
```

## Deployed Scripts (Testnet)

| Script | Code Hash | Tx Hash |
|--------|-----------|---------|
| task-type | `0xa822599c...dafe` | `0x85db3ca9...84f0` index 0 |
| task-lock | `0xc8c01f16...9349` | `0x8348906a...14c` index 1 |
| dep-group | — | `0x03d149bf...9d1a` index 0 |

## Cell Data Layout

```
[reward: 8 bytes LE u64]
[deadline: 8 bytes LE u64]
[status: 1 byte]
[worker_lock_hash: 32 bytes, present when status >= claimed]
[title_len: 2 bytes LE][title: n bytes]
[desc_len: 2 bytes LE][description: m bytes]
```

Script args: `[poster_lock_hash: 32 bytes][reviewer_lock_hash: 32 bytes]`

## Getting Started

### On-chain scripts

```bash
# Install RISC-V target
rustup target add riscv64imac-unknown-none-elf

# Build
$env:CLANG="C:\Program Files\LLVM\bin\clang.exe"
$env:TARGET_CC="C:\Program Files\LLVM\bin\clang.exe"
$env:TARGET_AR="C:\Program Files\LLVM\bin\llvm-ar.exe"
$env:RUSTFLAGS="-C target-feature=+zba,+zbb,+zbc,+zbs,-a -C debug-assertions"
cargo build --target=riscv64imac-unknown-none-elf --release -p task-type -p task-lock

# Test
$env:RUSTFLAGS=""
$env:MODE="release"
$env:TOP=$PWD
cargo test --package tests -- --nocapture
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Connect a CKB testnet wallet (JoyID recommended).

## Tests

8 test cases, all passing:

| Test | Description |
|------|-------------|
| `test_post_task` | Poster creates a task cell |
| `test_claim_task` | Worker claims an open task |
| `test_submit_task` | Worker submits proof |
| `test_approve_task` | Reviewer approves → completed |
| `test_reject_task` | Reviewer rejects → disputed |
| `test_cancel_task` | Poster cancels and reclaims CKB |
| `test_unauthorized_claim_fails` | Attacker cannot skip to completed |
| `test_invalid_transition_fails` | Cannot jump states |

See [TESTING.md](TESTING.md) for the full frontend testing guide.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Scripts | Rust + ckb-std, compiled to RISC-V |
| Testing | ckb-testtool |
| Frontend | Next.js 16 + TypeScript |
| CKB SDK | CCC (`@ckb-ccc/connector-react`) |
| Wallet | JoyID (via CCC) |
| Styling | Tailwind CSS |
| Network | CKB Testnet |

## License

MIT
