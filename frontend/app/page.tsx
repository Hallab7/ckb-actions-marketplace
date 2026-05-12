"use client";

import { useState } from "react";
import Link from "next/link";
import { TaskCard } from "@/components/TaskCard";
import { StatsBar } from "@/components/StatsBar";
import { TaskStatus } from "@/lib/types";
import { useTasks } from "@/hooks/useTasks";

const FILTERS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Accepted", value: "claimed" },
  { label: "Under Review", value: "submitted" },
  { label: "Completed", value: "completed" },
];

export default function Home() {
  const { tasks, loading, error, refetch } = useTasks();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = tasks.filter((t) => {
    const matchStatus = filter === "all" || t.status === filter;
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="mb-8 grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border p-1 pr-4 text-sm text-secondary" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
            <span className="signal-pill rounded-full px-3 py-1.5 text-xs font-bold">Live testnet</span>
            Escrowed CKB work market
          </div>
          <div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.02] tracking-normal text-primary sm:text-5xl lg:text-6xl">
              A production dashboard for <span className="gradient-text">on-chain action flows.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-secondary">
              Discover, create, accept, and settle CKB-backed tasks from one responsive marketplace. Rewards are locked in cells and released only through the contract workflow.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/post" className="primary-button gap-2 px-6 text-sm">
              Create Task
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/dashboard" className="secondary-button px-6 text-sm font-semibold">
              View Dashboard
            </Link>
          </div>
        </section>

        <section className="cube-stage rounded-[32px] border p-6" style={{ borderColor: "var(--border)", background: "radial-gradient(circle at 72% 24%, rgba(109,40,217,0.3), transparent 28%), radial-gradient(circle at 32% 78%, rgba(34,211,238,0.16), transparent 32%), var(--surface-muted)" }}>
          <div className="absolute left-6 top-6 rounded-full border px-3 py-1 text-xs font-semibold text-secondary" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>CKBind network surface</div>
          <div className="absolute right-6 top-6 flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
            Synced
          </div>
          <div className="cube-scene" aria-hidden="true">
            {["alpha", "beta", "gamma", "delta"].map((name) => (
              <div key={name} className={`cube-float cube-${name}`}>
                <div className="cube3d">
                  <span className="cube-face cube-front" />
                  <span className="cube-face cube-back" />
                  <span className="cube-face cube-right" />
                  <span className="cube-face cube-left" />
                  <span className="cube-face cube-top" />
                  <span className="cube-face cube-bottom" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <StatsBar tasks={tasks} />

      <div className="mb-6 flex flex-col gap-3 rounded-3xl border p-3 sm:flex-row" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-12"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-2xl border p-1" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                filter === f.value ? "active-pill text-primary" : "text-muted hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-200">
          <span>{error} Showing cached data.</span>
          <button onClick={refetch} className="text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse rounded-3xl p-5">
              <div className="mb-3 h-4 w-3/4 rounded bg-zinc-500/10" />
              <div className="mb-2 h-3 w-full rounded bg-zinc-500/10" />
              <div className="mb-4 h-3 w-2/3 rounded bg-zinc-500/10" />
              <div className="flex justify-between">
                <div className="h-4 w-16 rounded bg-zinc-500/10" />
                <div className="h-4 w-20 rounded bg-zinc-500/10" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rounded-3xl py-16 text-center text-muted">
          <p className="text-sm font-medium">No tasks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard key={`${task.outPoint.txHash}-${task.outPoint.index}`} task={task} />
          ))}
        </div>
      )}

     <div
  className="mt-12 rounded-[32px] border p-8 text-center"
  style={{
    borderColor: "var(--border)",
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(16,185,129,0.08)), var(--surface-muted)",
  }}
>
  <h2 className="mb-2 text-lg font-bold text-primary">
    Have a task to get done?
  </h2>

  <p className="mb-5 text-sm text-secondary">
    Create a task and lock your reward on-chain. Pay only when the work is done.
  </p>

  <Link href="/post" className="primary-button px-6 text-sm">
    Create Task
  </Link>
</div>
    </div>
  );
}
