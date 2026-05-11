"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { MOCK_TASKS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { shannonsToCKB } from "@/lib/types";
import Link from "next/link";

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decoded = decodeURIComponent(id);

  const task = MOCK_TASKS.find(
    (t) => `${t.outPoint.txHash}-${t.outPoint.index}` === decoded
  );

  if (!task) return notFound();

  const steps = [
    { label: "Posted", done: true },
    { label: "Claimed", done: task.status !== "open" },
    { label: "Submitted", done: ["submitted", "completed", "disputed"].includes(task.status) },
    { label: "Completed", done: task.status === "completed" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tasks
      </Link>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-semibold text-gray-900 leading-snug">
            {task.title}
          </h1>
          <StatusBadge status={task.status} />
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {task.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Reward</p>
            <p className="text-xl font-semibold text-gray-900">
              {shannonsToCKB(task.reward)}{" "}
              <span className="text-sm font-normal text-gray-400">CKB</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Deadline</p>
            <p className="text-xl font-semibold text-gray-900">
              Block{" "}
              <span className="text-sm font-normal text-gray-400">
                #{task.deadline.toString()}
              </span>
            </p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-6">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                    step.done
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {step.done ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-4 ${
                    steps[i + 1].done ? "bg-gray-900" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Action button */}
        <ActionButton status={task.status} />
      </div>

      {/* On-chain info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-3">On-chain Info</h2>
        <div className="space-y-2">
          <InfoRow label="Tx Hash" value={task.outPoint.txHash} mono />
          <InfoRow label="Poster" value={task.posterLockHash} mono />
          <InfoRow label="Reviewer" value={task.reviewerLockHash} mono />
          {task.workerLockHash && (
            <InfoRow label="Worker" value={task.workerLockHash} mono />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ status }: { status: string }) {
  const actions: Record<string, { label: string; style: string }> = {
    open: {
      label: "Claim Task",
      style: "bg-gray-900 text-white hover:bg-gray-700",
    },
    claimed: {
      label: "Submit Proof",
      style: "bg-gray-900 text-white hover:bg-gray-700",
    },
    submitted: {
      label: "Approve / Reject",
      style: "bg-gray-900 text-white hover:bg-gray-700",
    },
    completed: {
      label: "Claim Reward",
      style: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    disputed: {
      label: "Resolve Dispute",
      style: "bg-red-600 text-white hover:bg-red-700",
    },
  };

  const action = actions[status];
  if (!action) return null;

  return (
    <button
      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${action.style}`}
      onClick={() => alert("Connect wallet to interact with this task.")}
    >
      {action.label}
    </button>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-xs text-gray-700 truncate ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
