"use client";

import { useState } from "react";
import { TaskCard } from "@/components/TaskCard";
import { StatsBar } from "@/components/StatsBar";
import { MOCK_TASKS } from "@/lib/mock-data";
import { TaskStatus } from "@/lib/types";
import Link from "next/link";

const FILTERS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Claimed", value: "claimed" },
  { label: "Under Review", value: "submitted" },
  { label: "Completed", value: "completed" },
];

export default function Home() {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_TASKS.filter((t) => {
    const matchStatus = filter === "all" || t.status === filter;
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Task Marketplace
        </h1>
        <p className="text-gray-500 text-sm">
          Earn CKB by completing on-chain tasks. Rewards are escrowed in cells —
          no platform holds your funds.
        </p>
      </div>

      <StatsBar tasks={MOCK_TASKS} />

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 placeholder-gray-400"
          />
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No tasks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={`${task.outPoint.txHash}-${task.outPoint.index}`}
              task={task}
            />
          ))}
        </div>
      )}

      {/* Post CTA */}
      <div className="mt-12 bg-gray-900 rounded-2xl p-8 text-center">
        <h2 className="text-white font-semibold text-lg mb-2">
          Have a task to get done?
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Post a task and lock your reward on-chain. Pay only when the work is
          done.
        </p>
        <Link
          href="/post"
          className="inline-block bg-white text-gray-900 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Post a Task
        </Link>
      </div>
    </div>
  );
}
