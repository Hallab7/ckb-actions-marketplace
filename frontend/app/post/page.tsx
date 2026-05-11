"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
    reviewer: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: build and send transaction via CCC
    await new Promise((r) => setTimeout(r, 1000));
    alert("Task posted! (Connect wallet to submit on-chain)");
    setSubmitting(false);
    router.push("/");
  }

  const isValid =
    form.title.trim() &&
    form.description.trim() &&
    Number(form.reward) > 0 &&
    Number(form.deadline) > 0 &&
    form.reviewer.trim();

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Post a Task</h1>
        <p className="text-sm text-gray-500">
          Your reward will be locked in a CKB cell. It releases only when the
          reviewer approves the work.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Field label="Title" hint="Short, clear description of the task">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Build a CKB wallet component"
            className="input"
            required
          />
        </Field>

        {/* Description */}
        <Field label="Description" hint="What needs to be done, acceptance criteria">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the task in detail..."
            rows={4}
            className="input resize-none"
            required
          />
        </Field>

        {/* Reward + Deadline */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Reward (CKB)" hint="Minimum 61 CKB">
            <div className="relative">
              <input
                type="number"
                value={form.reward}
                onChange={(e) => set("reward", e.target.value)}
                placeholder="100"
                min="61"
                step="1"
                className="input pr-12"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                CKB
              </span>
            </div>
          </Field>

          <Field label="Deadline (block)" hint="Block number deadline">
            <input
              type="number"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              placeholder="5000"
              min="1"
              className="input"
              required
            />
          </Field>
        </div>

        {/* Reviewer */}
        <Field
          label="Reviewer Address"
          hint="Who will approve or reject the submission"
        >
          <input
            type="text"
            value={form.reviewer}
            onChange={(e) => set("reviewer", e.target.value)}
            placeholder="ckt1..."
            className="input font-mono text-xs"
            required
          />
        </Field>

        {/* Summary */}
        {isValid && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
            <p className="font-medium text-gray-900 mb-2">Summary</p>
            <div className="space-y-1 text-gray-600 text-xs">
              <div className="flex justify-between">
                <span>Reward locked</span>
                <span className="font-medium text-gray-900">{form.reward} CKB</span>
              </div>
              <div className="flex justify-between">
                <span>Deadline</span>
                <span>Block #{form.deadline}</span>
              </div>
              <div className="flex justify-between">
                <span>Reviewer</span>
                <span className="font-mono truncate max-w-32">{form.reviewer}</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Posting..." : "Post Task & Lock Reward"}
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          outline: none;
          color: #111827;
        }
        .input:focus {
          border-color: #9ca3af;
        }
        .input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
