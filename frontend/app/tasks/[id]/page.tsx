"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { shannonsToCKB, TaskStatus } from "@/lib/types";
import { useTask } from "@/hooks/useTask";
import { useCcc } from "@ckb-ccc/connector-react";
import {
  claimTask,
  submitTask,
  approveTask,
  rejectTask,
  cancelTask,
} from "@/lib/transactions";
import Link from "next/link";

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decoded = decodeURIComponent(id);
  // ID format: {txHash}-{index} where txHash is 0x + 64 hex chars
  // Split on the last "-"
  const lastDash = decoded.lastIndexOf("-");
  const txHash = decoded.slice(0, lastDash);
  const index = Number(decoded.slice(lastDash + 1));

  const { task, loading, error } = useTask(txHash, index);
  const { open, signerInfo } = useCcc();
  const [pending, setPending] = useState(false);
  const [resultTx, setResultTx] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);

  if (loading) return <LoadingSkeleton />;
  if (!task) return notFound();

  const steps = [
    { label: "Posted", done: true },
    { label: "Claimed", done: task.status !== "open" },
    { label: "Submitted", done: ["submitted", "completed", "disputed"].includes(task.status) },
    { label: "Completed", done: task.status === "completed" },
  ];

  async function runTx(fn: () => Promise<string>) {
    if (!signerInfo?.signer) { open(); return; }
    setPending(true);
    setTxError(null);
    try {
      const hash = await fn();
      setResultTx(hash);
    } catch (e: any) {
      setTxError(e?.message ?? "Transaction failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tasks
      </Link>

      {/* Success banner */}
      {resultTx && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          Transaction sent!{" "}
          <a href={`https://testnet.explorer.nervos.org/transaction/${resultTx}`}
            target="_blank" rel="noopener noreferrer"
            className="underline font-mono text-xs">{resultTx.slice(0, 20)}...</a>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-semibold text-gray-900 leading-snug">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">{task.description}</p>

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
              Block <span className="text-sm font-normal text-gray-400">#{task.deadline.toString()}</span>
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-6">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                  step.done ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-400"
                }`}>
                  {step.done ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-4 ${steps[i + 1].done ? "bg-gray-900" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {txError && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
            {txError}
          </div>
        )}

        {/* Action buttons */}
        <ActionButtons
          status={task.status}
          pending={pending}
          showReject={showReject}
          onSetShowReject={setShowReject}
          onClaim={() => runTx(() => claimTask(signerInfo!.signer, task.outPoint.txHash, task.outPoint.index))}
          onSubmit={() => runTx(() => submitTask(signerInfo!.signer, task.outPoint.txHash, task.outPoint.index))}
          onApprove={() => runTx(() => approveTask(signerInfo!.signer, task.outPoint.txHash, task.outPoint.index))}
          onReject={() => runTx(() => rejectTask(signerInfo!.signer, task.outPoint.txHash, task.outPoint.index))}
          onCancel={() => runTx(() => cancelTask(signerInfo!.signer, task.outPoint.txHash, task.outPoint.index))}
        />
      </div>

      {/* On-chain info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-3">On-chain Info</h2>
        <div className="space-y-2">
          <InfoRow label="Tx Hash" value={task.outPoint.txHash} link={`https://testnet.explorer.nervos.org/transaction/${task.outPoint.txHash}`} />
          <InfoRow label="Poster" value={task.posterLockHash} />
          <InfoRow label="Reviewer" value={task.reviewerLockHash} />
          {task.workerLockHash && <InfoRow label="Worker" value={task.workerLockHash} />}
        </div>
      </div>
    </div>
  );
}

function ActionButtons({
  status, pending, showReject, onSetShowReject,
  onClaim, onSubmit, onApprove, onReject, onCancel,
}: {
  status: TaskStatus;
  pending: boolean;
  showReject: boolean;
  onSetShowReject: (v: boolean) => void;
  onClaim: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
}) {
  if (status === "open") return (
    <div className="flex gap-2">
      <button onClick={onClaim} disabled={pending}
        className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors">
        {pending ? "Sending..." : "Claim Task"}
      </button>
      <button onClick={onCancel} disabled={pending}
        className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:border-gray-300 disabled:opacity-40 transition-colors">
        Cancel
      </button>
    </div>
  );

  if (status === "claimed") return (
    <button onClick={onSubmit} disabled={pending}
      className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors">
      {pending ? "Sending..." : "Submit Proof"}
    </button>
  );

  if (status === "submitted") return (
    <div className="flex gap-2">
      <button onClick={onApprove} disabled={pending}
        className="flex-1 bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors">
        {pending ? "Sending..." : "Approve"}
      </button>
      <button onClick={onReject} disabled={pending}
        className="flex-1 border border-red-200 text-red-600 text-sm font-medium py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-40 transition-colors">
        {pending ? "Sending..." : "Reject"}
      </button>
    </div>
  );

  if (status === "completed") return (
    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm text-center">
      ✓ Task completed. Reward has been released.
    </div>
  );

  if (status === "disputed") return (
    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
      This task is under dispute. Awaiting reviewer resolution.
    </div>
  );

  return null;
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="text-xs text-gray-700 font-mono truncate hover:text-gray-900 underline">
          {value}
        </a>
      ) : (
        <span className="text-xs text-gray-700 font-mono truncate">{value}</span>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-24 mb-6" />
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <div className="h-6 bg-gray-100 rounded w-3/4 mb-4" />
        <div className="h-3 bg-gray-100 rounded w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded w-2/3 mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
