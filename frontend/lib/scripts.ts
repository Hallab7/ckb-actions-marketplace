/**
 * Deployed script configuration.
 * Replace these with actual values after deploying to testnet.
 */
export const TASK_TYPE_SCRIPT = {
  codeHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  hashType: "data1" as const,
  txHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  index: 0,
};

export const TASK_LOCK_SCRIPT = {
  codeHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  hashType: "data1" as const,
  txHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  index: 0,
};

export const CKB_RPC_URL = "https://testnet.ckb.dev/rpc";
export const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";

export const SCRIPTS_DEPLOYED = false; // flip to true after deployment
