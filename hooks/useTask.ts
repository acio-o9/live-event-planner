"use client";

import { useState, useEffect, useCallback } from "react";
import { tasksApi } from "@/lib/api/tasks";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "@/lib/types";

export function useTask(
  liveEventId: string,
  milestoneId: string,
  liveEventBandId?: string
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTasks(await tasksApi.list(liveEventId, milestoneId, liveEventBandId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [liveEventId, milestoneId, liveEventBandId]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(
    async (data: CreateTaskRequest) => {
      const task = await tasksApi.create(liveEventId, milestoneId, data);
      setTasks((prev) => [...prev, task]);
      return task;
    },
    [liveEventId, milestoneId]
  );

  const update = useCallback(
    async (taskId: string, data: UpdateTaskRequest) => {
      const task = await tasksApi.update(liveEventId, milestoneId, taskId, data);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
      return task;
    },
    [liveEventId, milestoneId]
  );

  const remove = useCallback(
    async (taskId: string) => {
      await tasksApi.delete(liveEventId, milestoneId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    [liveEventId, milestoneId]
  );

  return { tasks, isLoading, error, create, update, remove, reload: load };
}
