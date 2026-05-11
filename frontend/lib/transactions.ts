import { ccc } from "@ckb-ccc/connector-react";
import { TASK_TYPE_SCRIPT, TASK_LOCK_SCRIPT, DEP_GROUP } from "./scripts";
import {
  encodeTaskData,
  encodeTaskArgs,
  hexToBytes,
  bytesToHex,
} from "./codec";
import { STATUS_OPEN, STATUS_CLAIMED, STATUS_SUBMITTED, STATUS_COMPLETED, STATUS_DISPUTED } from "./types";
import { fetchTaskByOutPoint } from "./indexer";

// Cell dep referencing the deployed scripts via dep group
function scriptCellDep(): ccc.CellDep {
  return ccc.CellDep.from({
    outPoint: {
      txHash: DEP_GROUP.txHash,
      index: ccc.numFrom(DEP_GROUP.index),
    },
    depType: "depGroup",
  });
}

function taskTypeScript(args: string): ccc.Script {
  return ccc.Script.from({
    codeHash: TASK_TYPE_SCRIPT.codeHash,
    hashType: TASK_TYPE_SCRIPT.hashType,
    args,
  });
}

function taskLockScript(args: string): ccc.Script {
  return ccc.Script.from({
    codeHash: TASK_LOCK_SCRIPT.codeHash,
    hashType: TASK_LOCK_SCRIPT.hashType,
    args,
  });
}

/**
 * Post a new task — creates a task cell with reward locked inside.
 */
export async function postTask(
  signer: ccc.Signer,
  title: string,
  description: string,
  rewardCKB: number,
  deadlineBlock: bigint,
  reviewerAddress: string
): Promise<string> {
  const client = signer.client;

  // Get poster lock hash
  const posterAddr = await signer.getRecommendedAddressObj();
  const posterLockHash = hexToBytes(posterAddr.script.hash());

  // Get reviewer lock hash from address
  const reviewerAddr = await ccc.Address.fromString(reviewerAddress, client);
  const reviewerLockHash = hexToBytes(reviewerAddr.script.hash());

  const taskArgs = bytesToHex(encodeTaskArgs(posterLockHash, reviewerLockHash));
  const rewardShannons = BigInt(Math.floor(rewardCKB * 1e8));

  const cellData = encodeTaskData({
    reward: rewardShannons,
    deadline: deadlineBlock,
    status: STATUS_OPEN,
    title,
    description,
  });

  const tx = ccc.Transaction.from({
    outputs: [
      {
        lock: taskLockScript(taskArgs),
        type: taskTypeScript(taskArgs),
      },
    ],
    outputsData: [bytesToHex(cellData)],
  });

  // Add cell dep for scripts
  tx.cellDeps.push(scriptCellDep());

  // Calculate minimum capacity needed for the task cell
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);

  const txHash = await signer.sendTransaction(tx);
  return txHash;
}

/**
 * Claim an open task — transitions status from open → claimed.
 */
export async function claimTask(
  signer: ccc.Signer,
  txHash: string,
  index: number
): Promise<string> {
  const client = signer.client;

  const task = await fetchTaskByOutPoint(txHash, index);
  if (!task) throw new Error("Task not found");
  if (task.status !== "open") throw new Error("Task is not open");

  const workerAddr = await signer.getRecommendedAddressObj();
  const workerLockHash = hexToBytes(workerAddr.script.hash());

  const taskArgs = buildTaskArgs(task.posterLockHash, task.reviewerLockHash);

  const claimedData = encodeTaskData({
    reward: task.reward,
    deadline: task.deadline,
    status: STATUS_CLAIMED,
    workerLockHash,
    title: task.title,
    description: task.description,
  });

  const tx = ccc.Transaction.from({
    inputs: [
      {
        previousOutput: {
          txHash,
          index: ccc.numFrom(index),
        },
      },
    ],
    outputs: [
      {
        lock: taskLockScript(taskArgs),
        type: taskTypeScript(taskArgs),
      },
    ],
    outputsData: [bytesToHex(claimedData)],
  });

  tx.cellDeps.push(scriptCellDep());

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);

  return await signer.sendTransaction(tx);
}

/**
 * Submit proof — transitions status from claimed → submitted.
 */
export async function submitTask(
  signer: ccc.Signer,
  txHash: string,
  index: number
): Promise<string> {
  const task = await fetchTaskByOutPoint(txHash, index);
  if (!task) throw new Error("Task not found");
  if (task.status !== "claimed") throw new Error("Task is not claimed");

  const taskArgs = buildTaskArgs(task.posterLockHash, task.reviewerLockHash);
  const workerLockHash = task.workerLockHash
    ? hexToBytes(task.workerLockHash)
    : undefined;

  const submittedData = encodeTaskData({
    reward: task.reward,
    deadline: task.deadline,
    status: STATUS_SUBMITTED,
    workerLockHash,
    title: task.title,
    description: task.description,
  });

  const tx = ccc.Transaction.from({
    inputs: [{ previousOutput: { txHash, index: ccc.numFrom(index) } }],
    outputs: [{ lock: taskLockScript(taskArgs), type: taskTypeScript(taskArgs) }],
    outputsData: [bytesToHex(submittedData)],
  });

  tx.cellDeps.push(scriptCellDep());
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);

  return await signer.sendTransaction(tx);
}

/**
 * Approve task — reviewer transitions submitted → completed.
 */
export async function approveTask(
  signer: ccc.Signer,
  txHash: string,
  index: number
): Promise<string> {
  const task = await fetchTaskByOutPoint(txHash, index);
  if (!task) throw new Error("Task not found");
  if (task.status !== "submitted") throw new Error("Task is not submitted");

  const taskArgs = buildTaskArgs(task.posterLockHash, task.reviewerLockHash);
  const workerLockHash = task.workerLockHash
    ? hexToBytes(task.workerLockHash)
    : undefined;

  const completedData = encodeTaskData({
    reward: task.reward,
    deadline: task.deadline,
    status: STATUS_COMPLETED,
    workerLockHash,
    title: task.title,
    description: task.description,
  });

  const tx = ccc.Transaction.from({
    inputs: [{ previousOutput: { txHash, index: ccc.numFrom(index) } }],
    outputs: [{ lock: taskLockScript(taskArgs), type: taskTypeScript(taskArgs) }],
    outputsData: [bytesToHex(completedData)],
  });

  tx.cellDeps.push(scriptCellDep());
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);

  return await signer.sendTransaction(tx);
}

/**
 * Reject task — reviewer transitions submitted → disputed.
 */
export async function rejectTask(
  signer: ccc.Signer,
  txHash: string,
  index: number
): Promise<string> {
  const task = await fetchTaskByOutPoint(txHash, index);
  if (!task) throw new Error("Task not found");
  if (task.status !== "submitted") throw new Error("Task is not submitted");

  const taskArgs = buildTaskArgs(task.posterLockHash, task.reviewerLockHash);
  const workerLockHash = task.workerLockHash
    ? hexToBytes(task.workerLockHash)
    : undefined;

  const disputedData = encodeTaskData({
    reward: task.reward,
    deadline: task.deadline,
    status: STATUS_DISPUTED,
    workerLockHash,
    title: task.title,
    description: task.description,
  });

  const tx = ccc.Transaction.from({
    inputs: [{ previousOutput: { txHash, index: ccc.numFrom(index) } }],
    outputs: [{ lock: taskLockScript(taskArgs), type: taskTypeScript(taskArgs) }],
    outputsData: [bytesToHex(disputedData)],
  });

  tx.cellDeps.push(scriptCellDep());
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);

  return await signer.sendTransaction(tx);
}

/**
 * Cancel task — poster reclaims CKB from an open task.
 */
export async function cancelTask(
  signer: ccc.Signer,
  txHash: string,
  index: number
): Promise<string> {
  const task = await fetchTaskByOutPoint(txHash, index);
  if (!task) throw new Error("Task not found");
  if (task.status !== "open") throw new Error("Only open tasks can be cancelled");

  const posterAddr = await signer.getRecommendedAddressObj();

  const tx = ccc.Transaction.from({
    inputs: [{ previousOutput: { txHash, index: ccc.numFrom(index) } }],
    outputs: [{ lock: posterAddr.script }],
    outputsData: ["0x"],
  });

  tx.cellDeps.push(scriptCellDep());
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);

  return await signer.sendTransaction(tx);
}

// Helper: build task args hex string from lock hashes
function buildTaskArgs(posterLockHash: string, reviewerLockHash: string): string {
  const poster = hexToBytes(posterLockHash);
  const reviewer = hexToBytes(reviewerLockHash);
  return bytesToHex(encodeTaskArgs(poster, reviewer));
}
