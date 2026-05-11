"use client";

import { useState } from "react";
import { MOCK_TASKS } from "@/lib/mock-data";
import { TaskCard } from "@/components/TaskCard";

// Simulate "my" tasks by picking a few from mock data
const MY_POSTED = MOCK_TASKS.slice(0, 2);
const MY_CLAIMED = MOCK_TASKS.slice(2, 4);

const TABS = [
  { id: "posted", label: "Posted by me" },
  { id: "claimed", label: "Claimed by me" },
];

export default function DashboardPage() {
  const [tab, setTab] = useState("posted");

  const tasks = tab === "posted" ? MY_POSTED : MY_CLAIMED;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Track your posted tasks and claimed work.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tasks Posted", value: MY_POSTED.length },
          { label: "Tasks Claimed", value: MY_CLAIMED.length },
          {
            label: "CKB Locked",
            value:
              MY_POSTED.filter((t) => t.status !== "completed")
                .reduce((s, t) => s + Number(t.reward) / 1e8, 0)
                .toFixed(0) + " CKB",
          },
          {
            label: "CKB Earned",
            value:
              MY_CLAIMED.filter((t) => t.status === "completed")
                .reduce((s, t) => s + Number(t.reward) / 1e8, 0)
                .toFixed(0) + " CKB",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No tasks here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={`${task.outPoint.txHash}-${task.outPoint.index}`}
              task={task}
            />
          ))}
        </div>
      )}
    </div>
  );
}
