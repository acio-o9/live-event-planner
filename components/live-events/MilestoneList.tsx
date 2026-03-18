"use client";

import { Milestone, Task } from "@/lib/types";
import { TaskList } from "@/components/tasks/TaskList";

interface Props {
  milestones: Milestone[];
  liveEventId: string;
  onMilestoneStatusChange: (milestoneId: string, status: Milestone["status"]) => Promise<void>;
}

const STATUS_LABEL: Record<Milestone["status"], string> = {
  pending: "未着手",
  in_progress: "進行中",
  completed: "完了",
};

const STATUS_COLOR: Record<Milestone["status"], string> = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

export function MilestoneList({ milestones, liveEventId, onMilestoneStatusChange }: Props) {
  return (
    <ol className="space-y-4">
      {milestones
        .sort((a, b) => a.order - b.order)
        .map((milestone) => (
          <li
            key={milestone.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                {milestone.dueDate && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    期限: {new Date(milestone.dueDate).toLocaleDateString("ja-JP")}
                  </p>
                )}
              </div>
              <select
                value={milestone.status}
                onChange={(e) =>
                  onMilestoneStatusChange(
                    milestone.id,
                    e.target.value as Milestone["status"]
                  )
                }
                className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLOR[milestone.status]}`}
              >
                {(Object.keys(STATUS_LABEL) as Milestone["status"][]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <TaskList
              liveEventId={liveEventId}
              milestoneId={milestone.id}
              initialTasks={milestone.tasks}
            />
          </li>
        ))}
    </ol>
  );
}
