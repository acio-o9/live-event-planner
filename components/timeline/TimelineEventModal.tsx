"use client";

import { TLEventType, ETYPE, fmtTime, H_START, H_END } from "./timelineConstants";

const STAFF_BAND_ID = "__staff__";

interface Band {
  id: string;
  name: string;
}

export interface ModalState {
  open: boolean;
  mode: "create" | "edit";
  eventId?: string;
  bandId: string;
  type: TLEventType;
  startMin: number;
  durationMin: number;
  note: string;
}

export const CLOSED_MODAL: ModalState = {
  open: false,
  mode: "create",
  bandId: "",
  type: "rehearsal",
  startMin: 0,
  durationMin: 30,
  note: "",
};

interface Props {
  modal: ModalState;
  bands: Band[];
  onClose: () => void;
  onChange: (patch: Partial<ModalState>) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function TimelineEventModal({ modal, bands, onClose, onChange, onSave, onDelete }: Props) {
  if (!modal.open) return null;

  const timeOptions = Array.from({ length: (H_END - H_START) * 6 }, (_, i) => i * 10);
  const isStaff = modal.bandId === STAFF_BAND_ID;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold mb-4">
          {modal.mode === "create" ? "予定を追加" : "予定を編集"}
        </h2>
        <div className="space-y-4">
          {/* Band selector (バンド列のみ、編集時のみ表示) */}
          {!isStaff && modal.mode === "edit" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">バンド</label>
              <select
                value={modal.bandId}
                onChange={(e) => onChange({ bandId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Event type (バンド列のみ) */}
          {!isStaff && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">種別</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.entries(ETYPE) as [TLEventType, typeof ETYPE[TLEventType]][]).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => onChange({ type: k })}
                    className="px-3 py-2 text-xs rounded-lg border-2 font-medium transition-all text-left"
                    style={
                      modal.type === k
                        ? { background: v.bg, borderColor: v.border, color: v.fg }
                        : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }
                    }
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start time */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">開始時刻</label>
            <select
              value={modal.startMin}
              onChange={(e) => onChange({ startMin: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeOptions.map((min) => (
                <option key={min} value={min}>{fmtTime(min)}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">時間</label>
            <div className="flex gap-1.5 flex-wrap">
              {[10, 15, 20, 25, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => onChange({ durationMin: d })}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                    modal.durationMin === d
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {d}分
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isStaff ? "タイトル" : "メモ"}
            </label>
            <input
              type="text"
              value={modal.note}
              onChange={(e) => onChange({ note: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onSave()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isStaff ? "例: 全体打ち合わせ" : "例: PAチェックあり"}
            />
          </div>
        </div>

        <div className="flex justify-between mt-5">
          {modal.mode === "edit" ? (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              削除
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={onSave}
              className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
