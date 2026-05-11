"use client";

import { useState, useEffect, useCallback } from "react";
import { Task } from "@/lib/types";
import { fetchAllTasks } from "@/lib/indexer";
import { MOCK_TASKS } from "@/lib/mock-data";
import { SCRIPTS_DEPLOYED } from "@/lib/scripts";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (SCRIPTS_DEPLOYED) {
        const onchain = await fetchAllTasks();
        setTasks(onchain);
      } else {
        // Fall back to mock data during development
        setTasks(MOCK_TASKS);
      }
    } catch (e) {
      setError("Failed to load tasks from chain.");
      setTasks(MOCK_TASKS); // graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { tasks, loading, error, refetch: load };
}
