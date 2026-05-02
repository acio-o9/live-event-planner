"use client";

import { useState } from "react";
import { Milestone, CreateMilestoneRequest, UpdateMilestoneRequest } from "@/lib/types";
import { TaskList } from "@/components/tasks/TaskList";

interface Props {
  milestones: Milestone[];
  liveEventId: string;
  canManageEvent?: boolean;
  onMilestoneStatusChange: (milestoneId: string, status: Milestone["status"]) => Promise<void>;
  onMilestoneAdd: (data: CreateMilestoneRequest) => Promise<void>;
  onMilestoneEdit: (milestoneId: string, data: UpdateMilestoneRequest) => Promise<void>;
  onMilestoneDelete: (milestoneId: string) => Promise<void>;
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

function sortByDueDate(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

interface AddFormState {
  title: string;
  dueDate: string;
}

interface EditFormState {
  title: string;
  dueDate: string;
}

export function MilestoneList({
  milestones,
  liveEventId,
  canManageEvent,
  onMilestoneStatusChange,
  onMilestoneAdd,
  onMilestoneEdit,
  onMilestoneDelete,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>({ title: "", dueDate: "" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ title: "", dueDate: "" });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const handleAddSubmit = async () => {
    if (!addForm.title.trim()) {
      setAddError("タイトルを入力してください");
      return;
    }
    setAddLoading(true);
    setAddError("");
    try {
      await onMilestoneAdd({
        title: addForm.title.trim(),
        dueDate: addForm.dueDate || undefined,
      });
      setAddForm({ title: "", dueDate: "" });
      setShowAddForm(false);
    } catch (e) {
      setAddError((e as Error).message);
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (milestone: Milestone) => {
    setEditingId(milestone.id);
    setEditForm({
      title: milestone.title,
      dueDate: milestone.dueDate ? milestone.dueDate.slice(0, 10) : "",
    });
    setEditError("");
  };

  const handleEditSubmit = async (milestoneId: string) => {
    if (!editForm.title.trim()) {
      setEditError("タイトルを入力してください");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      await onMilestoneEdit(milestoneId, {
        title: editForm.title.trim(),
        dueDate: editForm.dueDate || undefined,
      });
      setEditingId(null);
    } catch (e) {
      setEditError((e as Error).message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (milestoneId: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    try {
      await onMilestoneDelete(milestoneId);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const sorted = sortByDueDate(milestones);

  return (
    <div className="space-y-4">
      {canManageEvent && (
        <div className="flex justify-end">
          <button
            onClick={() => { setShowAddForm(true); setAddError(""); }}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + マイルストーンを追加
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-blue-900">新規マイルストーン</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="タイトル（必須）"
              value={addForm.title}
              onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
              autoFocus
            />
            <input
              type="date"
              value={addForm.dueDate}
              onChange={(e) => setAddForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
            />
          </div>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAddSubmit}
              disabled={addLoading}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {addLoading ? "追加中…" : "追加"}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddForm({ title: "", dueDate: "" }); }}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <ol className="space-y-4">
        {sorted.map((milestone) => (
          <li key={milestone.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {editingId === milestone.id ? (
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
                  autoFocus
                />
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
                />
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubmit(milestone.id)}
                    disabled={editLoading}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editLoading ? "保存中…" : "保存"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                  {milestone.dueDate && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      期限: {new Date(milestone.dueDate).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canManageEvent ? (
                    <select
                      value={milestone.status}
                      onChange={(e) =>
                        onMilestoneStatusChange(milestone.id, e.target.value as Milestone["status"])
                      }
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLOR[milestone.status]}`}
                    >
                      {(Object.keys(STATUS_LABEL) as Milestone["status"][]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[milestone.status]}`}>
                      {STATUS_LABEL[milestone.status]}
                    </span>
                  )}
                  {canManageEvent && (
                    <button
                      onClick={() => startEdit(milestone)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      編集
                    </button>
                  )}
                  {canManageEvent && (
                    <button
                      onClick={() => handleDelete(milestone.id, milestone.title)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            )}
            <TaskList
              liveEventId={liveEventId}
              milestoneId={milestone.id}
              initialTasks={milestone.tasks}
              canManageEvent={canManageEvent}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
