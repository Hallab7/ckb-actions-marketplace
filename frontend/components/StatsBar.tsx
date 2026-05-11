import { Task, shannonsToCKB } from "@/lib/types";

export function StatsBar({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => t.status === "open").length;
  const totalReward = tasks
    .filter((t) => t.status === "open")
    .reduce((sum, t) => sum + t.reward, BigInt(0));
  const completed = tasks.filter((t) => t.status === "completed").length;

  const stats = [
    { label: "Open Tasks", value: open.toString() },
    { label: "CKB Available", value: shannonsToCKB(totalReward) },
    { label: "Completed", value: completed.toString() },
    { label: "Total Tasks", value: tasks.length.toString() },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
