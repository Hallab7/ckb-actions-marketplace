import { TaskStatus, STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  open: "border-emerald-400/30 bg-emerald-400/10 text-emerald-500 dark:text-emerald-300",
  claimed: "border-cyan-400/30 bg-cyan-400/10 text-cyan-600 dark:text-cyan-300",
  submitted: "border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-300",
  completed: "border-violet-400/30 bg-violet-400/10 text-violet-600 dark:text-violet-200",
  disputed: "border-rose-400/30 bg-rose-400/10 text-rose-600 dark:text-rose-300",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
