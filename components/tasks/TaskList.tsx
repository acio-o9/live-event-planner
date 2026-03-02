"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { tasksApi } from "@/lib/api/tasks";

interface Props {
  liveEventId: string;
  milestoneId: string;
  initialTasks: Task[];
  liveEventBandId?: string;
}

export function TaskList({ liveEventId, milestoneId, initialTasks, liveEventBandId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const toggleStatus = async (task: Task) => {
    const next: Task["status"] =
      task.status === "completed" ? "pending" : "completed";
    const updated = await tasksApi.update(liveEventId, milestoneId, task.id, {
      status: next,
    });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    const task = await tasksApi.create(liveEventId, milestoneId, {
      title: newTitle.trim(),
      liveEventBandId,
    });
    setTasks((prev) => [...prev, task]);
    setNewTitle("");
    setIsAdding(false);
  };

  const deleteTask = async (taskId: string) => {
    await tasksApi.delete(liveEventId, milestoneId, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const visibleTasks = liveEventBandId
    ? tasks.filter((t) => !t.liveEventBandId || t.liveEventBandId === liveEventBandId)
    : tasks.filter((t) => !t.liveEventBandId);

  return (
    <div className="space-y-1">
      {visibleTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2 group py-1"
        >
          <input
            type="checkbox"
            checked={task.status === "completed"}
            onChange={() => toggleStatus(task)}
            className="rounded"
          />
          <span
            className={`text-sm flex-1 ${
              task.status === "completed" ? "line-through text-gray-400" : "text-gray-700"
            }`}
          >
            {task.title}
          </span>
          {task.assigneeUserSub && (
            <span className="text-xs text-gray-400 hidden group-hover:inline">
              @{task.assigneeUserSub.slice(0, 8)}
            </span>
          )}
          <button
            onClick={() => deleteTask(task.id)}
            className="text-xs text-gray-300 hover:text-red-500 hidden group-hover:inline"
          >
            ×
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            autoFocus
            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="タスクを入力..."
          />
          <button
            onClick={addTask}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            追加
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewTitle(""); }}
            className="text-xs text-gray-500 px-2 py-1"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs text-gray-400 hover:text-blue-600 mt-1"
        >
          + タスクを追加
        </button>
      )}
    </div>
  );
}
