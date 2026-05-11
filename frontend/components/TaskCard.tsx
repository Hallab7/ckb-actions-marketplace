import Link from "next/link";
import { Task, shannonsToCKB } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function TaskCard({ task }: { task: Task }) {
  const id = `${task.outPoint.txHash}-${task.outPoint.index}`;

  return (
    <Link href={`/tasks/${encodeURIComponent(id)}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-medium text-gray-900 text-sm leading-snug group-hover:text-gray-700 line-clamp-2">
            {task.title}
          </h3>
          <StatusBadge status={task.status} />
        </div>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">
          {task.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-900 font-semibold text-sm">
              {shannonsToCKB(task.reward)}
            </span>
            <span className="text-gray-400 text-xs">CKB</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Block {task.deadline.toString()}
          </div>
        </div>
      </div>
    </Link>
  );
}
