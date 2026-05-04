"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventClickArg, DateSelectArg, EventDropArg, EventInput } from "@fullcalendar/core";
import { useState, useRef, useCallback } from "react";

const EVENT_COLORS = [
  { label: "青", value: "#3b82f6" },
  { label: "緑", value: "#22c55e" },
  { label: "赤", value: "#ef4444" },
  { label: "紫", value: "#a855f7" },
  { label: "橙", value: "#f97316" },
];

const INITIAL_EVENTS: EventInput[] = [
  {
    id: "1",
    title: "渋谷クアトロ ライブ",
    start: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0],
    color: "#3b82f6",
    extendedProps: { note: "バンド全員集合、リハは14時から" },
  },
  {
    id: "2",
    title: "スタジオリハーサル",
    start: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    color: "#22c55e",
    extendedProps: { note: "新曲3曲を重点的に" },
  },
  {
    id: "3",
    title: "機材搬入",
    start: `${new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0]}T10:00:00`,
    end: `${new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0]}T12:00:00`,
    color: "#f97316",
    extendedProps: { note: "トラック2台分" },
  },
];

type ModalMode = "create" | "edit" | null;

interface EventModal {
  mode: ModalMode;
  id?: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  note: string;
}

const EMPTY_MODAL: EventModal = {
  mode: null,
  title: "",
  start: "",
  end: "",
  allDay: true,
  color: "#3b82f6",
  note: "",
};

let nextId = 100;

export function CalendarView() {
  const [events, setEvents] = useState<EventInput[]>(INITIAL_EVENTS);
  const [modal, setModal] = useState<EventModal>(EMPTY_MODAL);
  const calendarRef = useRef<FullCalendar>(null);

  const handleDateSelect = useCallback((arg: DateSelectArg) => {
    setModal({
      mode: "create",
      title: "",
      start: arg.startStr,
      end: arg.endStr,
      allDay: arg.allDay,
      color: "#3b82f6",
      note: "",
    });
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const ev = arg.event;
    setModal({
      mode: "edit",
      id: ev.id,
      title: ev.title,
      start: ev.startStr,
      end: ev.endStr || ev.startStr,
      allDay: ev.allDay,
      color: ev.backgroundColor || "#3b82f6",
      note: (ev.extendedProps?.note as string) || "",
    });
  }, []);

  const handleEventDrop = useCallback((arg: EventDropArg) => {
    const ev = arg.event;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === ev.id
          ? { ...e, start: ev.startStr, end: ev.endStr || ev.startStr }
          : e
      )
    );
  }, []);

  const handleSave = () => {
    if (!modal.title.trim()) return;
    if (modal.mode === "create") {
      const newEvent: EventInput = {
        id: String(++nextId),
        title: modal.title,
        start: modal.start,
        end: modal.end,
        allDay: modal.allDay,
        color: modal.color,
        extendedProps: { note: modal.note },
      };
      setEvents((prev) => [...prev, newEvent]);
    } else if (modal.mode === "edit" && modal.id) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === modal.id
            ? {
                ...e,
                title: modal.title,
                color: modal.color,
                extendedProps: { note: modal.note },
              }
            : e
        )
      );
    }
    setModal(EMPTY_MODAL);
  };

  const handleDelete = () => {
    if (modal.id) {
      setEvents((prev) => prev.filter((e) => e.id !== modal.id));
    }
    setModal(EMPTY_MODAL);
  };

  return (
    <div className="relative">
      {/* FullCalendar */}
      <div className="bg-white rounded-lg shadow p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          buttonText={{
            today: "今日",
            month: "月",
            week: "週",
            day: "日",
            list: "リスト",
          }}
          locale="ja"
          events={events}
          selectable={true}
          selectMirror={true}
          editable={true}
          droppable={true}
          dayMaxEvents={3}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="auto"
        />
      </div>

      <p className="mt-2 text-xs text-gray-400 text-center">
        日付をクリック/ドラッグで予定追加 ・ イベントをクリックで編集 ・ ドラッグで移動
      </p>

      {/* Modal */}
      {modal.mode && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setModal(EMPTY_MODAL)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">
              {modal.mode === "create" ? "予定を追加" : "予定を編集"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={modal.title}
                  onChange={(e) => setModal((m) => ({ ...m, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: スタジオリハ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  色
                </label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(({ label, value }) => (
                    <button
                      key={value}
                      title={label}
                      onClick={() => setModal((m) => ({ ...m, color: value }))}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        modal.color === value
                          ? "border-gray-800 scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: value }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ
                </label>
                <textarea
                  value={modal.note}
                  onChange={(e) => setModal((m) => ({ ...m, note: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="メモ（任意）"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              {modal.mode === "edit" ? (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  削除
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setModal(EMPTY_MODAL)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={!modal.title.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
