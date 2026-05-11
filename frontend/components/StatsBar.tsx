import { Task, shannonsToCKB } from "@/lib/types";

export function StatsBar({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => t.status === "open").length;
  const totalReward = tasks
    .filter((t) => t.status === "open")
    .reduce((sum, t) => sum + t.reward, BigInt(0));
  const completed = tasks.filter((t) => t.status === "completed").length;

  const stats = [
    { label: "Open Tasks", value: open.toString(), tone: "from-emerald-400 to-cyan-300" },
    { label: "CKB Available", value: shannonsToCKB(totalReward), tone: "from-fuchsia-400 to-violet-400" },
    { label: "Completed", value: completed.toString(), tone: "from-violet-300 to-sky-300" },
    { label: "Total Tasks", value: tasks.length.toString(), tone: "from-orange-300 to-pink-400" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card relative overflow-hidden rounded-3xl p-4">
          {/* <div className={`absolute right-4 top-4 h-10 w-10 rounded-2xl bg-gradient-to-br ${s.tone} opacity-80 blur-[1px]`} /> */}
          <p className="relative text-2xl font-bold text-primary">{s.value}</p>
          <p className="relative mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
