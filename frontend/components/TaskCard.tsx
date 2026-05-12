import Link from "next/link";
import { Task, shannonsToCKB } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function blocksToHuman(blocks: bigint): string {
  const totalSeconds = Number(blocks) * 10;
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    const remMins = minutes % 60;
    if (remHours === 0 && remMins === 0) return `${days}d`;
    if (remMins === 0) return `${days}d ${remHours}h`;
    if (remHours === 0) return `${days}d ${remMins}min`;
    return `${days}d ${remHours}h ${remMins}min`;
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return remMins === 0 ? `${hours}h` : `${hours}h ${remMins}min`;
  }
  if (minutes > 0) return `${minutes}min`;
  return `${totalSeconds}s`;
}

export function TaskCard({ task }: { task: Task }) {
  const id = `${task.outPoint.txHash}-${task.outPoint.index}`;

  return (
    <Link href={`/tasks/${encodeURIComponent(id)}`}>
      <div className="card group cursor-pointer rounded-3xl p-5 hover:-translate-y-0.5 hover:border-fuchsia-400/30 hover:shadow-[0_22px_70px_rgba(168,85,247,0.18)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-primary group-hover:text-fuchsia-500">
            {task.title}
          </h3>
          <StatusBadge status={task.status} />
        </div>

        <p className="mb-5 line-clamp-3 text-xs leading-relaxed text-secondary">
          {task.description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary">
              {shannonsToCKB(task.reward)}
            </span>
            <span className="text-xs font-semibold text-muted">CKB</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {blocksToHuman(task.deadline)}
          </div>
        </div>
      </div>
    </Link>
  );
}
