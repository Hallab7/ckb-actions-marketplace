export type TaskStatus =
  | "open"
  | "claimed"
  | "submitted"
  | "completed"
  | "disputed";

export const STATUS_OPEN = 0;
export const STATUS_CLAIMED = 1;
export const STATUS_SUBMITTED = 2;
export const STATUS_COMPLETED = 3;
export const STATUS_DISPUTED = 4;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  claimed: "Accepted",
  submitted: "Under Review",
  completed: "Completed",
  disputed: "Disputed",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  claimed: "bg-blue-50 text-blue-700 border-blue-200",
  submitted: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  disputed: "bg-red-50 text-red-700 border-red-200",
};

export function statusFromCode(code: number): TaskStatus {
  switch (code) {
    case STATUS_OPEN: return "open";
    case STATUS_CLAIMED: return "claimed";
    case STATUS_SUBMITTED: return "submitted";
    case STATUS_COMPLETED: return "completed";
    case STATUS_DISPUTED: return "disputed";
    default: return "open";
  }
}

export interface Task {
  outPoint: { txHash: string; index: number };
  reward: bigint;       // in shannons
  deadline: bigint;     // block number
  status: TaskStatus;
  workerLockHash?: string;
  posterLockHash: string;
  reviewerLockHash: string;
  // Off-chain metadata (stored in cell data after the fixed fields)
  title: string;
  description: string;
}

export function shannonsToCKB(shannons: bigint): string {
  const ckb = Number(shannons) / 1e8;
  return ckb.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function ckbToShannons(ckb: number): bigint {
  return BigInt(Math.floor(ckb * 1e8));
}
