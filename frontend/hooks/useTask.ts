"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/types";
import { fetchTaskByOutPoint } from "@/lib/indexer";
import { MOCK_TASKS } from "@/lib/mock-data";
import { SCRIPTS_DEPLOYED } from "@/lib/scripts";

export function useTask(txHash: string, index: number) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (SCRIPTS_DEPLOYED) {
          const t = await fetchTaskByOutPoint(txHash, index);
          setTask(t);
        } else {
          const id = `${txHash}-${index}`;
          const t = MOCK_TASKS.find(
            (m) => `${m.outPoint.txHash}-${m.outPoint.index}` === id
          ) ?? null;
          setTask(t);
        }
      } catch {
        setError("Failed to load task.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [txHash, index]);

  return { task, loading, error };
}
