"use client";

import { useState, useEffect } from "react";
import { useCcc } from "@ckb-ccc/connector-react";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/lib/types";
import { fetchTasksByAddress } from "@/lib/indexer";
import { MOCK_TASKS } from "@/lib/mock-data";
import { SCRIPTS_DEPLOYED } from "@/lib/scripts";

const TABS = [
  { id: "posted", label: "Posted by me" },
  { id: "claimed", label: "Claimed by me" },
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
      <div className="text-center py-24">
        <p className="text-gray-500 text-sm mb-4">Connect your wallet to view your dashboard.</p>
        <button onClick={open}
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-xs text-gray-400 font-mono">{address}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tasks Posted", value: posted.length.toString() },
          { label: "Tasks Claimed", value: claimed.length.toString() },
          { label: "CKB Locked", value: `${totalLocked.toFixed(0)} CKB` },
          { label: "CKB Earned", value: `${totalEarned.toFixed(0)} CKB` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-4" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No tasks here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard key={`${task.outPoint.txHash}-${task.outPoint.index}`} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
