import { ccc } from "@ckb-ccc/connector-react";
import { TASK_LOCK_SCRIPT } from "./scripts";
import { decodeTaskData, bytesToHex, hexToBytes } from "./codec";
import { Task, statusFromCode } from "./types";

function getClient(): ccc.ClientPublicTestnet {
  return new ccc.ClientPublicTestnet();
}

function cellToTask(cell: ccc.Cell): Task | null {
  try {
    const rawData = cell.outputData;
    if (!rawData || rawData === "0x") return null;

    const data = hexToBytes(rawData);
    const decoded = decodeTaskData(data);

    const args = cell.cellOutput.lock.args;
    const argsHex = args.startsWith("0x") ? args.slice(2) : args;
    if (argsHex.length < 128) return null;

    const posterLockHash = "0x" + argsHex.slice(0, 64);
    const reviewerLockHash = "0x" + argsHex.slice(64, 128);

    const outPoint = cell.outPoint!;

    return {
      outPoint: {
        txHash: outPoint.txHash,
        index: Number(outPoint.index),
      },
      reward: decoded.reward,
      deadline: decoded.deadline,
      status: statusFromCode(decoded.status),
      workerLockHash: decoded.workerLockHash
        ? bytesToHex(decoded.workerLockHash)
        : undefined,
      posterLockHash,
      reviewerLockHash,
      title: decoded.title,
      description: decoded.description,
    };
  } catch {
    return null;
  }
}

export async function fetchAllTasks(): Promise<Task[]> {
  const client = getClient();
  const tasks: Task[] = [];

  const lockScript = ccc.Script.from({
    codeHash: TASK_LOCK_SCRIPT.codeHash,
    hashType: TASK_LOCK_SCRIPT.hashType,
    args: "0x",
  });

  for await (const cell of client.findCells({
    script: lockScript,
    scriptType: "lock",
    scriptSearchMode: "prefix",
    withData: true,
  })) {
    const task = cellToTask(cell);
    if (task) tasks.push(task);
  }

  return tasks;
}

export async function fetchTaskByOutPoint(
  txHash: string,
  index: number
): Promise<Task | null> {
  const client = getClient();

  const cell = await client.getCellLive(
    ccc.OutPoint.from({ txHash: txHash as `0x${string}`, index: ccc.numFrom(index) }),
    true
  );

  if (!cell) return null;
  return cellToTask(cell);
}

export async function fetchTasksByAddress(address: string): Promise<{
  posted: Task[];
  claimed: Task[];
}> {
  const client = getClient();
  const addr = await ccc.Address.fromString(address, client);
  const myLockHash = "0x" + addr.script.hash().slice(2);

  const all = await fetchAllTasks();

  return {
    posted: all.filter((t) => t.posterLockHash === myLockHash),
    claimed: all.filter((t) => t.workerLockHash === myLockHash),
  };
}

export async function getCurrentBlock(): Promise<bigint> {
  const client = getClient();
  const tip = await client.getTip();
  return BigInt(tip);
}
