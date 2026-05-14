"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCcc } from "@ckb-ccc/connector-react";
import { postTask } from "@/lib/transactions";
import { blocksToHuman } from "@/lib/blocks";

export default function PostPage() {
  const router = useRouter();
  const { open, signerInfo } = useCcc();
  const [myAddress, setMyAddress] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
    reviewer: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Resolve connected address
  useEffect(() => {
    if (!signerInfo?.signer) { setMyAddress(null); return; }
    signerInfo.signer.getRecommendedAddress().then(setMyAddress).catch(() => setMyAddress(null));
  }, [signerInfo]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signerInfo?.signer) {
      open();
      return;
    }

    setSubmitting(true);
    setTxError(null);
    try {
      const hash = await postTask(
        signerInfo.signer,
        form.title,
        form.description,
        Number(form.reward),
        BigInt(form.deadline),
        form.reviewer
      );
      setTxHash(hash);
    } catch (e: any) {
      setTxError(e?.message ?? "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid =
    form.title.trim() &&
    form.description.trim() &&
    Number(form.reward) >= 61 &&
    Number(form.deadline) > 0 &&
    form.reviewer.trim().startsWith("ckt");

  // Success state
  if (txHash) {
    return (
      <div className="card mx-auto max-w-xl rounded-[32px] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400/10">
          <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-primary">Task Created</h2>
        <p className="mb-4 text-sm text-secondary">Your reward is now locked on-chain.</p>
        <a
          href={`https://testnet.explorer.nervos.org/transaction/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 block truncate font-mono text-xs text-muted underline hover:text-primary"
        >
          {txHash}
        </a>
        <button
          onClick={() => router.push("/")}
          className="primary-button px-6 text-sm"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Create escrow</p>
        <h1 className="text-3xl font-semibold text-primary md:text-5xl">Create Task</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
          Your reward will be locked in a CKB cell. It releases only when the reviewer approves.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 rounded-[32px] p-5 md:p-7">
        <Field label="Title" hint="Short, clear description of the task">
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Build a CKB wallet component" className="input" required />
        </Field>

        <Field label="Description" hint="What needs to be done, acceptance criteria">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the task in detail..." rows={4} className="input resize-none" required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Reward (CKB)" hint="Minimum 61 CKB">
            <div className="relative">
              <input type="number" value={form.reward} onChange={(e) => set("reward", e.target.value)}
                placeholder="100" min="61" step="1" className="input pr-12" required />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">CKB</span>
            </div>
          </Field>
          <Field label="Deadline (block)" hint="Block number deadline">
            <input type="number" value={form.deadline} onChange={(e) => set("deadline", e.target.value)}
              placeholder="5000" min="1" className="input" required />
            {form.deadline && Number(form.deadline) > 0 && (
              <p className="mt-1.5 text-xs text-muted">
                ≈ {blocksToHuman(Number(form.deadline))}
              </p>
            )}
          </Field>
        </div>

        <Field label="Reviewer Address" hint="Who will approve or reject the submission">
          <div className="relative">
            <input
              type="text"
              value={form.reviewer}
              onChange={(e) => set("reviewer", e.target.value)}
              placeholder="ckt1..."
              className="input pr-28 font-mono text-xs"
              required
            />
            {myAddress && (
              <button
                type="button"
                onClick={() => set("reviewer", myAddress)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                style={{
                  background: "var(--surface-muted)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Use mine
              </button>
            )}
          </div>
        </Field>

        {isValid && (
          <div className="muted-card rounded-3xl p-4 text-sm">
            <p className="mb-2 font-semibold text-primary">Summary</p>
            <div className="space-y-2 text-xs text-secondary">
              <div className="flex justify-between">
                <span>Reward locked</span>
                <span className="font-semibold text-primary">{form.reward} CKB</span>
              </div>
              <div className="flex justify-between">
                <span>Deadline</span>
                <span>{blocksToHuman(Number(form.deadline))}</span>
              </div>
              <div className="flex justify-between">
                <span>Reviewer</span>
                <span className="max-w-32 truncate font-mono">{form.reviewer}</span>
              </div>
            </div>
          </div>
        )}

        {txError && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs text-rose-600 dark:text-rose-200">
            {txError}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="primary-button w-full text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? "Sending transaction..."
            : !signerInfo?.signer
            ? "Connect Wallet"
            : "Create Task"}
        </button>
      </form>

    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-primary">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
