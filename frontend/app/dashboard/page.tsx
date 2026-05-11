"use client";

import { useState, useEffect } from "react";
import { useCcc } from "@ckb-ccc/connector-react";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/lib/types";
import { fetchTasksByAddress } from "@/lib/indexer";
import { MOCK_TASKS } from "@/lib/mock-data";
import { SCRIPTS_DEPLOYED } from "@/lib/scripts";

const TABS = [
  { id: "posted", label: "Created by me" },
  { id: "claimed", label: "Accepted by me" },
];

export default function DashboardPage() {
  const { open, signerInfo } = useCcc();
  const [tab, setTab] = useState("posted");
  const [posted, setPosted] = useState<Task[]>([]);
  const [claimed, setClaimed] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // Resolve address from signer
  useEffect(() => {
    if (!signerInfo?.signer) { setAddress(null); return; }
    signerInfo.signer.getRecommendedAddress().then(setAddress).catch(() => setAddress(null));
  }, [signerInfo]);

  // Load tasks when address is known
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    const load = async () => {
      try {
        if (SCRIPTS_DEPLOYED) {
          const result = await fetchTasksByAddress(address);
          setPosted(result.posted);
          setClaimed(result.claimed);
        } else {
          // Mock: show first 2 as posted, next 2 as claimed
          setPosted(MOCK_TASKS.slice(0, 2));
          setClaimed(MOCK_TASKS.slice(2, 4));
        }
      } catch {
        setPosted(MOCK_TASKS.slice(0, 2));
        setClaimed(MOCK_TASKS.slice(2, 4));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address]);

  const tasks = tab === "posted" ? posted : claimed;

  const totalLocked = posted
    .filter((t) => t.status !== "completed")
    .reduce((s, t) => s + Number(t.reward) / 1e8, 0);

  const totalEarned = claimed
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + Number(t.reward) / 1e8, 0);

  if (!address) {
    return (
      <div className="card mx-auto max-w-xl rounded-[32px] px-6 py-20 text-center">
        <p className="mb-4 text-sm text-secondary">Connect your wallet to view your dashboard.</p>
        <button onClick={open}
          className="primary-button px-6 text-sm">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Operator console</p>
          <h1 className="text-3xl font-semibold text-primary md:text-5xl">Dashboard</h1>
          <p className="mt-3 max-w-2xl truncate font-mono text-xs text-muted">{address}</p>
        </div>
        <div className="rounded-full border px-4 py-2 text-sm font-semibold text-secondary" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
          Testnet account
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
        {[
          { label: "Tasks Created", value: posted.length.toString() },
          { label: "Tasks Accepted", value: claimed.length.toString() },
          { label: "CKB Locked", value: `${totalLocked.toFixed(0)} CKB` },
          { label: "CKB Earned", value: `${totalEarned.toFixed(0)} CKB` },
        ].map((s) => (
          <div key={s.label} className="card rounded-3xl p-4">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex w-fit gap-1 rounded-full border p-1" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t.id ? "active-pill" : "text-muted hover:text-primary"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card animate-pulse rounded-3xl p-5">
              <div className="mb-3 h-4 w-3/4 rounded bg-zinc-500/10" />
              <div className="mb-4 h-3 w-full rounded bg-zinc-500/10" />
              <div className="h-4 w-1/3 rounded bg-zinc-500/10" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card rounded-3xl py-16 text-center text-muted">
          <p className="text-sm">No tasks here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={`${task.outPoint.txHash}-${task.outPoint.index}`} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
