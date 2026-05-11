/**
 * Deployed script configuration — CKB Testnet
 * Deployed: 2026-05-11 (v2 — fixed creation handling)
 * Cell tx:      0x85db3ca938d0560607429520c4af0212262be822961eec8b9b125bcb180c84f0
 * DepGroup tx:  0x03d149bf6ac5d9fcf19ad67c49cd9c41abe64d4312f74bf19f01a6a5d3659d1a
 */

export const TASK_TYPE_SCRIPT = {
  codeHash: "0xa822599c782183f8dc23b058eedfa580c5851061d3436f68d6f8bf011fb5dafe" as `0x${string}`,
  hashType: "data1" as const,
  txHash: "0x85db3ca938d0560607429520c4af0212262be822961eec8b9b125bcb180c84f0" as `0x${string}`,
  index: 0,
};

export const TASK_LOCK_SCRIPT = {
  codeHash: "0xc8c01f16206b970e6950dbbe0ff642ff61c15dc895b9be02ad5bdbc365829349" as `0x${string}`,
  hashType: "data1" as const,
  txHash: "0x8348906af6f43f7da56bd35e1765c3f577e6194c0b95595f4e87188e9d27214c" as `0x${string}`,
  index: 1,
};

// Dep group — reference this in cell deps instead of the individual scripts
export const DEP_GROUP = {
  txHash: "0x03d149bf6ac5d9fcf19ad67c49cd9c41abe64d4312f74bf19f01a6a5d3659d1a" as `0x${string}`,
  index: 0,
};

// Type IDs (use these as codeHash with hashType: "type" for upgradeable scripts)
export const TASK_TYPE_ID = "0xe0bae6939fb325ce18631945cb01a3ed206206aa866126fa5144190fde02d902";
export const TASK_LOCK_TYPE_ID = "0xf14fb9cb20a79ad141547c2c0054fcd5ed6f8b3556c80f02f3efbd4e270b87e0";

export const CKB_RPC_URL = "https://testnet.ckb.dev/rpc";
export const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";

export const SCRIPTS_DEPLOYED = true;
