import { Task } from "./types";

export const MOCK_TASKS: Task[] = [
  {
    outPoint: { txHash: "0xabc1", index: 0 },
    reward: BigInt(50_000_000_000),
    deadline: BigInt(5000),
    status: "open",
    posterLockHash: "0xposter1",
    reviewerLockHash: "0xreviewer1",
    title: "Build a CKB transaction explorer component",
    description:
      "Create a React component that displays CKB transaction details including inputs, outputs, and cell data. Should support both testnet and mainnet. Include TypeScript types and basic tests.",
  },
  {
    outPoint: { txHash: "0xabc2", index: 0 },
    reward: BigInt(30_000_000_000),
    deadline: BigInt(3000),
    status: "claimed",
    posterLockHash: "0xposter2",
    reviewerLockHash: "0xreviewer2",
    workerLockHash: "0xworker2",
    title: "Write documentation for ckb-std syscalls",
    description:
      "Document all syscalls available in ckb-std v1.1.0 with examples. Cover load_cell_data, load_script, load_witness, and the QueryIter pattern. Markdown format, hosted on GitHub.",
  },
  {
    outPoint: { txHash: "0xabc3", index: 0 },
    reward: BigInt(80_000_000_000),
    deadline: BigInt(8000),
    status: "submitted",
    posterLockHash: "0xposter3",
    reviewerLockHash: "0xreviewer3",
    workerLockHash: "0xworker3",
    title: "Implement a Spore DOB minting script",
    description:
      "Write a CKB type script in Rust that implements the Spore DOB standard for minting digital objects. Must include owner mode, transfer validation, and melt-to-reclaim logic.",
  },
  {
    outPoint: { txHash: "0xabc4", index: 0 },
    reward: BigInt(20_000_000_000),
    deadline: BigInt(2000),
    status: "completed",
    posterLockHash: "0xposter4",
    reviewerLockHash: "0xreviewer4",
    workerLockHash: "0xworker4",
    title: "Create a CKB testnet faucet UI",
    description:
      "Simple web UI for requesting testnet CKB. Connect wallet, click request, receive 100 CKB. Rate limited to once per address per day.",
  },
  {
    outPoint: { txHash: "0xabc5", index: 0 },
    reward: BigInt(100_000_000_000),
    deadline: BigInt(10000),
    status: "open",
    posterLockHash: "0xposter5",
    reviewerLockHash: "0xreviewer5",
    title: "Build an on-chain voting contract",
    description:
      "Implement a CKB type script for on-chain voting. Each vote is a cell. Lock script controls who can vote. Type script counts and validates votes. Include tests and a simple frontend.",
  },
  {
    outPoint: { txHash: "0xabc6", index: 0 },
    reward: BigInt(15_000_000_000),
    deadline: BigInt(1500),
    status: "disputed",
    posterLockHash: "0xposter6",
    reviewerLockHash: "0xreviewer6",
    workerLockHash: "0xworker6",
    title: "Write a CKB lock script tutorial",
    description:
      "Step-by-step tutorial explaining how to write a custom lock script in Rust. Cover the basics of ckb-std, error handling, and testing with ckb-testtool.",
  },
];
