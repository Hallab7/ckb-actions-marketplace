"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCcc } from "@ckb-ccc/connector-react";
import { StatusBadge } from "@/components/StatusBadge";
import { shannonsToCKB, TaskStatus } from "@/lib/types";
import { useTask } from "@/hooks/useTask";
import {
  approveTask,
  cancelTask,
  claimTask,
  rejectTask,
  submitTask,
} from "@/lib/transactions";

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decoded = decodeURIComponent(id);
  const lastDash = decoded.lastIndexOf("-");
  const txHash = decoded.slice(0, lastDash);
  const index = Number(decoded.slice(lastDash + 1));

  const { task, loading } = useTask(txHash, index);
  const { open, signerInfo } = useCcc();
  const [pending, setPending] = useState(false);
  const [resultTx, setResultTx] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);

  if (loading) return <LoadingSkeleton />;
  if (!task) return notFound();

  const steps = [
    { label: "Created", done: true },
    { label: "Accepted", done: task.status !== "open" },
    { label: "Submitted", done: ["submitted", "completed", "disputed"].includes(task.status) },
    { label: "Completed", done: task.status === "completed" },
  ];

  async function runTx(fn: () => Promise<string>) {
    if (!signerInfo?.signer) {
      open();
      return;
    }
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
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tasks
      </Link>

      {resultTx && (
        <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200">
          Transaction sent{" "}
          <a href={`https://testnet.explorer.nervos.org/transaction/${resultTx}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs underline">
            {resultTx.slice(0, 20)}...
          </a>
        </div>
      )}

      <div className="card mb-4 rounded-[32px] p-5 md:p-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-tight text-primary">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>

        <p className="mb-6 text-sm leading-7 text-secondary">{task.description}</p>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="muted-card rounded-3xl p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Reward</p>
            <p className="text-2xl font-bold text-primary">
              {shannonsToCKB(task.reward)} <span className="text-sm font-semibold text-muted">CKB</span>
            </p>
          </div>
          <div className="muted-card rounded-3xl p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Deadline</p>
            <p className="text-2xl font-bold text-primary">
              Block <span className="text-sm font-semibold text-muted">#{task.deadline.toString()}</span>
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-0 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex min-w-[120px] flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                  step.done ? "border-fuchsia-400 bg-fuchsia-500 text-white shadow-[0_0_24px_rgba(236,72,153,0.35)]" : "text-muted"
                }`}>
                  {step.done ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className="mt-2 whitespace-nowrap text-xs font-medium text-muted">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-1 mb-5 h-0.5 flex-1 ${steps[i + 1].done ? "bg-fuchsia-400" : "bg-zinc-500/20"}`} />
              )}
            </div>
          ))}
        </div>

        {txError && (
          <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-200">
            {txError}
          </div>
        )}

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

      <div className="card rounded-[32px] p-5">
        <h2 className="mb-3 text-sm font-bold text-primary">On-chain Info</h2>
        <div className="space-y-2">
          <InfoRow label="Tx Hash" value={task.outPoint.txHash} link={`https://testnet.explorer.nervos.org/transaction/${task.outPoint.txHash}`} />
          <InfoRow label="Creator" value={task.posterLockHash} />
          <InfoRow label="Reviewer" value={task.reviewerLockHash} />
          {task.workerLockHash && <InfoRow label="Worker" value={task.workerLockHash} />}
        </div>
      </div>
    </div>
  );
}

function ActionButtons({
  status,
  pending,
  showReject,
  onSetShowReject,
  onClaim,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
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
  void showReject;
  void onSetShowReject;

  if (status === "open") return (
    <div className="flex gap-2">
      <button onClick={onClaim} disabled={pending} className="primary-button flex-1 text-sm disabled:opacity-40">
        {pending ? "Sending..." : "Accept Task"}
      </button>
      <button onClick={onCancel} disabled={pending} className="secondary-button px-5 text-sm font-semibold disabled:opacity-40">
        Cancel
      </button>
    </div>
  );

  if (status === "claimed") return (
    <button onClick={onSubmit} disabled={pending} className="primary-button w-full text-sm disabled:opacity-40">
      {pending ? "Sending..." : "Submit Proof"}
    </button>
  );

  if (status === "submitted") return (
    <div className="flex gap-2">
      <button onClick={onApprove} disabled={pending} className="flex-1 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-40">
        {pending ? "Sending..." : "Approve"}
      </button>
      <button onClick={onReject} disabled={pending} className="flex-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-3 text-sm font-bold text-rose-600 disabled:opacity-40 dark:text-rose-200">
        {pending ? "Sending..." : "Reject"}
      </button>
    </div>
  );

  if (status === "completed") return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-600 dark:text-emerald-200">
      Task completed. Reward has been released.
    </div>
  );

  if (status === "disputed") return (
    <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-center text-sm text-rose-600 dark:text-rose-200">
      This task is under dispute. Awaiting reviewer resolution.
    </div>
  );

  return null;
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-xs font-semibold text-muted">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="truncate font-mono text-xs text-secondary underline hover:text-primary">
          {value}
        </a>
      ) : (
        <span className="truncate font-mono text-xs text-secondary">{value}</span>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="mb-6 h-4 w-24 rounded bg-zinc-500/10" />
      <div className="card mb-4 rounded-[32px] p-6">
        <div className="mb-4 h-6 w-3/4 rounded bg-zinc-500/10" />
        <div className="mb-2 h-3 w-full rounded bg-zinc-500/10" />
        <div className="mb-6 h-3 w-2/3 rounded bg-zinc-500/10" />
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="h-20 rounded-2xl bg-zinc-500/10" />
          <div className="h-20 rounded-2xl bg-zinc-500/10" />
        </div>
        <div className="h-10 rounded-2xl bg-zinc-500/10" />
      </div>
    </div>
  );
}
