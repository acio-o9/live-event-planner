"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTimelineEvents } from "@/hooks/useTimelineEvents";
import { CreateTimelineEventRequest } from "@/lib/types";
import { TimelineEventModal, ModalState, CLOSED_MODAL } from "./TimelineEventModal";
import {
  H_START, H_END, PX_PER_MIN, HOUR_H, TOTAL_H,
  TIME_COL_W, BAND_COL_W, STAFF_COL_W, HEADER_H,
  SNAP_MIN, DRAG_THRESHOLD_PX, STAFF_BAND_ID, STAFF_COLOR,
  BAND_PALETTE, ETYPE, TLEventType,
  minToY, yToMin, snapMin, clampMin, fmtTime,
} from "./timelineConstants";

interface TLEvent {
  id: string;
  eventBandId: string | null;
  type: TLEventType;
  startMin: number;
  durationMin: number;
  note: string;
}

interface DragPreview { startMin: number; bandId: string; }

function assignSublanes(evts: TLEvent[]): Map<string, { lane: number; totalLanes: number }> {
  const sorted = [...evts].sort((a, b) => a.startMin - b.startMin);
  const laneEnds: number[] = [];
  const laneOf = new Map<string, number>();
  for (const ev of sorted) {
    let lane = laneEnds.findIndex((end) => end <= ev.startMin);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = ev.startMin + ev.durationMin;
    laneOf.set(ev.id, lane);
  }
  const total = laneEnds.length || 1;
  const result = new Map<string, { lane: number; totalLanes: number }>();
  Array.from(laneOf.entries()).forEach(([id, lane]) => result.set(id, { lane, totalLanes: total }));
  return result;
}

function genReverseRehearsal(bands: { id: string }[]): CreateTimelineEventRequest[] {
  const reqs: CreateTimelineEventRequest[] = [];
  [...bands].reverse().forEach((band, i) => {
    reqs.push({ eventBandId: band.id, type: "rehearsal", startMin: i * 20, durationMin: 20, note: "逆リハ" });
  });
  const perfBase = (14 - H_START) * 60;
  bands.forEach((band, i) => {
    reqs.push({ eventBandId: band.id, type: "performance", startMin: perfBase + i * 35, durationMin: 30, note: `${i + 1}番手` });
  });
  reqs.push({ eventBandId: null, type: "other", startMin: (13 - H_START) * 60,      durationMin: 30,  note: "全体打ち合わせ" });
  reqs.push({ eventBandId: null, type: "other", startMin: (13 - H_START) * 60 + 30, durationMin: 30,  note: "開場 13:30" });
  reqs.push({ eventBandId: null, type: "other", startMin: (19 - H_START) * 60,      durationMin: 120, note: "打ち上げ" });
  return reqs;
}

interface Props {
  liveEventId: string;
  canEdit?: boolean;
}

export function TimelineView({ liveEventId, canEdit = false }: Props) {
  const { events: rawEvents, bands, isLoading, error, create, update, remove, bulkReplace } = useTimelineEvents(liveEventId);

  // ローカル表示用 (eventBandId → bandId として扱う)
  const events: TLEvent[] = rawEvents.map((e) => ({
    id: e.id,
    eventBandId: e.eventBandId,
    type: e.type as TLEventType,
    startMin: e.startMin,
    durationMin: e.durationMin,
    note: e.note,
  }));

  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  const [hiddenBands, setHiddenBands] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"bands" | "single">("bands");

  const toggleBand = useCallback((id: string) => {
    setHiddenBands((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const allHidden = hiddenBands.size === bands.length;
  const toggleAll = () => setHiddenBands(allHidden ? new Set() : new Set(bands.map((b) => b.id)));
  const visibleBands = bands.filter((b) => !hiddenBands.has(b.id));

  // Drag
  const dragRef = useRef<{
    eventId: string; origStart: number; origBandId: string;
    mouseY0: number; mouseX0: number;
  } | null>(null);
  const didDragRef = useRef(false);
  const [dragPreview, setDragPreview] = useState<Record<string, DragPreview>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (!canEdit) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dy = e.clientY - dragRef.current.mouseY0;
      const dx = e.clientX - dragRef.current.mouseX0;
      if (Math.abs(dy) > DRAG_THRESHOLD_PX || Math.abs(dx) > DRAG_THRESHOLD_PX) {
        didDragRef.current = true;
      }
      const ev = events.find((ev) => ev.id === dragRef.current!.eventId);
      if (!ev) return;
      const newStart = snapMin(clampMin(dragRef.current.origStart + yToMin(dy), ev.durationMin));
      let newBandId = dragPreview[dragRef.current.eventId]?.bandId ?? dragRef.current.origBandId;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const col = el?.closest("[data-band-id]") as HTMLElement | null;
      if (col?.dataset.bandId) newBandId = col.dataset.bandId;
      setDragPreview({ [dragRef.current.eventId]: { startMin: newStart, bandId: newBandId } });
    };

    const onUp = async () => {
      if (!dragRef.current) return;
      if (didDragRef.current) {
        const { eventId } = dragRef.current;
        const preview = dragPreview[eventId];
        if (preview) {
          const ev = events.find((e) => e.id === eventId);
          if (ev) {
            const newBandId = preview.bandId === STAFF_BAND_ID ? null : preview.bandId;
            await update(eventId, { startMin: preview.startMin, eventBandId: newBandId });
          }
        }
      }
      dragRef.current = null;
      setDraggingId(null);
      setDragPreview({});
      setTimeout(() => { didDragRef.current = false; }, 0);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [canEdit, events, dragPreview, update]);

  const handleEventMouseDown = useCallback((e: React.MouseEvent, ev: TLEvent) => {
    if (!canEdit) return;
    e.stopPropagation();
    const bandId = ev.eventBandId ?? STAFF_BAND_ID;
    dragRef.current = { eventId: ev.id, origStart: ev.startMin, origBandId: bandId, mouseY0: e.clientY, mouseX0: e.clientX };
    didDragRef.current = false;
    setDraggingId(ev.id);
  }, [canEdit]);

  const handleEventClick = useCallback((e: React.MouseEvent, ev: TLEvent) => {
    e.stopPropagation();
    if (didDragRef.current) return;
    if (!canEdit) return;
    const bandId = ev.eventBandId ?? STAFF_BAND_ID;
    setModal({ open: true, mode: "edit", eventId: ev.id, bandId, type: ev.type, startMin: ev.startMin, durationMin: ev.durationMin, note: ev.note });
  }, [canEdit]);

  const handleColumnClick = useCallback((e: React.MouseEvent, bandId: string) => {
    if (!canEdit) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const rawMin = yToMin(e.clientY - rect.top);
    const startMin = Math.max(0, Math.min(snapMin(rawMin), (H_END - H_START) * 60 - 30));
    const defaultType: TLEventType = bandId === STAFF_BAND_ID ? "other" : "rehearsal";
    setModal({ open: true, mode: "create", bandId, type: defaultType, startMin, durationMin: 30, note: "" });
  }, [canEdit]);

  const handleSave = async () => {
    if (modal.mode === "create") {
      const eventBandId = modal.bandId === STAFF_BAND_ID ? null : modal.bandId;
      await create({ eventBandId, type: modal.type, startMin: modal.startMin, durationMin: modal.durationMin, note: modal.note });
    } else if (modal.eventId) {
      const eventBandId = modal.bandId === STAFF_BAND_ID ? null : modal.bandId;
      await update(modal.eventId, { eventBandId, type: modal.type, startMin: modal.startMin, durationMin: modal.durationMin, note: modal.note });
    }
    setModal(CLOSED_MODAL);
  };

  const handleDelete = async () => {
    if (modal.eventId) await remove(modal.eventId);
    setModal(CLOSED_MODAL);
  };

  const handleBulkGenerate = async () => {
    const reqs = genReverseRehearsal(bands);
    await bulkReplace(reqs);
  };

  const hourSlots = Array.from({ length: H_END - H_START }, (_, i) => H_START + i);

  if (isLoading) return <div className="flex justify-center py-16 text-sm text-gray-400">読み込み中...</div>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="select-none">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {canEdit && (
          <>
            <button
              onClick={handleBulkGenerate}
              disabled={events.length > 0}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 disabled:hover:bg-indigo-600"
              title={events.length > 0 ? "クリアしてから生成してください" : ""}
            >
              叩きのタイムライン生成
            </button>
            <button
              onClick={() => {
                if (window.confirm("すべての予定を削除します。よろしいですか？")) {
                  Promise.all(events.map((e) => remove(e.id)));
                }
              }}
              className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              クリア
            </button>
          </>
        )}
        <button
          onClick={() => setViewMode((v) => (v === "bands" ? "single" : "bands"))}
          className={`px-4 py-2 text-sm rounded-lg border font-medium transition-colors ${
            viewMode === "single"
              ? "bg-gray-800 text-white border-gray-800"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {viewMode === "single" ? "バンド別に戻す" : "一列表示"}
        </button>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {(Object.entries(ETYPE) as [TLEventType, typeof ETYPE[TLEventType]][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border" style={{ background: v.bg, borderColor: v.border }} />
              <span className="text-xs text-gray-500">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Band filter */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={toggleAll}
          className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-all font-medium"
        >
          {allHidden ? "全表示" : "全非表示"}
        </button>
        {bands.map((band, idx) => {
          const color = BAND_PALETTE[idx % BAND_PALETTE.length];
          const visible = !hiddenBands.has(band.id);
          return (
            <button
              key={band.id}
              onClick={() => toggleBand(band.id)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-all font-medium"
              style={
                visible
                  ? { background: color + "20", borderColor: color, color }
                  : { background: "#f3f4f6", borderColor: "#d1d5db", color: "#9ca3af" }
              }
            >
              <span className="w-2 h-2 rounded-full" style={{ background: visible ? color : "#d1d5db" }} />
              {band.name}
            </button>
          );
        })}
      </div>

      {/* Timeline grid */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow bg-white">
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 640 }}>
          <div
            style={{
              minWidth: TIME_COL_W + STAFF_COL_W + (viewMode === "bands" ? visibleBands.length * BAND_COL_W : Math.max(BAND_COL_W * 2, 320)),
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Sticky header */}
            <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200">
              <div
                className="shrink-0 sticky left-0 z-30 bg-gray-50 border-r border-gray-200"
                style={{ width: TIME_COL_W, height: HEADER_H }}
              />
              <div
                className="shrink-0 border-r-2 flex items-center gap-2 px-3"
                style={{ width: STAFF_COL_W, height: HEADER_H, borderColor: STAFF_COLOR, background: "#eef2ff" }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STAFF_COLOR }} />
                <span className="text-sm font-semibold" style={{ color: STAFF_COLOR }}>スタッフ共通</span>
              </div>
              {viewMode === "single" && (
                <div
                  className="shrink-0 border-r border-gray-200 flex items-center px-3"
                  style={{ width: Math.max(BAND_COL_W * 2, 320), height: HEADER_H }}
                >
                  <span className="text-sm font-medium text-gray-700">全バンド（一列表示）</span>
                </div>
              )}
              {viewMode === "bands" &&
                visibleBands.map((band) => {
                  const origIdx = bands.indexOf(band);
                  const color = BAND_PALETTE[origIdx % BAND_PALETTE.length];
                  return (
                    <div
                      key={band.id}
                      className="shrink-0 border-r border-gray-200 last:border-r-0 flex items-center px-3"
                      style={{ width: BAND_COL_W, height: HEADER_H }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ background: color }} />
                      <span className="text-sm font-medium text-gray-700 truncate">{band.name}</span>
                    </div>
                  );
                })}
            </div>

            {/* Body */}
            <div className="flex">
              {/* Time column */}
              <div
                className="shrink-0 sticky left-0 z-10 bg-gray-50 border-r border-gray-200"
                style={{ width: TIME_COL_W }}
              >
                <div style={{ height: TOTAL_H, position: "relative" }}>
                  {hourSlots.map((h) => (
                    <div
                      key={h}
                      className="absolute w-full flex justify-end pr-2"
                      style={{ top: (h - H_START) * HOUR_H }}
                    >
                      <span className="text-xs text-gray-400 leading-none">{String(h).padStart(2, "0")}:00</span>
                    </div>
                  ))}
                  {hourSlots.map((h) => (
                    <div
                      key={`m${h}`}
                      className="absolute w-full flex justify-end pr-2"
                      style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2 }}
                    >
                      <span className="text-xs text-gray-300 leading-none">:30</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff column */}
              {(() => {
                const staffEvts = events.filter((ev) => ev.eventBandId === null);
                return (
                  <div
                    data-band-id={STAFF_BAND_ID}
                    className={`shrink-0 relative ${canEdit ? "cursor-crosshair" : "cursor-default"}`}
                    style={{ width: STAFF_COL_W, height: TOTAL_H, background: "#f5f3ff", borderRight: `2px solid ${STAFF_COLOR}40` }}
                    onClick={(e) => handleColumnClick(e, STAFF_BAND_ID)}
                  >
                    {hourSlots.map((h) => (
                      <div key={h} className="absolute w-full border-t" style={{ top: (h - H_START) * HOUR_H, borderColor: `${STAFF_COLOR}20` }} />
                    ))}
                    {hourSlots.map((h) => (
                      <div key={`m${h}`} className="absolute w-full border-t" style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2, borderColor: `${STAFF_COLOR}10` }} />
                    ))}
                    {staffEvts.map((ev) => {
                      const startMin = dragPreview[ev.id]?.startMin ?? ev.startMin;
                      const evH = Math.max(ev.durationMin * PX_PER_MIN - 2, 10);
                      const isDragging = draggingId === ev.id;
                      return (
                        <div
                          key={ev.id}
                          data-band-id={STAFF_BAND_ID}
                          className={`absolute rounded flex flex-col justify-center px-2 overflow-hidden ${canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                          style={{
                            top: minToY(startMin) + 1, left: 2, right: 2, height: evH,
                            background: "#ede9fe", borderLeft: `3px solid ${STAFF_COLOR}`,
                            color: "#4c1d95", opacity: isDragging ? 0.7 : 1,
                            zIndex: isDragging ? 20 : 1,
                            boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.2)" : undefined,
                          }}
                          onMouseDown={(e) => handleEventMouseDown(e, ev)}
                          onClick={(e) => handleEventClick(e, ev)}
                        >
                          <div className="text-xs font-semibold truncate leading-tight">{ev.note || "タスク"}</div>
                          {evH > 28 && <div className="text-xs opacity-70 leading-tight">{fmtTime(startMin)}–{fmtTime(startMin + ev.durationMin)}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Band columns */}
              {viewMode === "bands" &&
                visibleBands.map((band) => {
                  const effectiveEvts = events.filter((ev) => {
                    const effectiveBandId = dragPreview[ev.id]?.bandId ?? (ev.eventBandId ?? STAFF_BAND_ID);
                    return effectiveBandId === band.id;
                  });
                  return (
                    <div
                      key={band.id}
                      data-band-id={band.id}
                      className={`shrink-0 border-r border-gray-200 last:border-r-0 relative ${canEdit ? "cursor-crosshair" : "cursor-default"}`}
                      style={{ width: BAND_COL_W, height: TOTAL_H }}
                      onClick={(e) => handleColumnClick(e, band.id)}
                    >
                      {hourSlots.map((h) => (
                        <div key={h} className="absolute w-full border-t border-gray-100" style={{ top: (h - H_START) * HOUR_H }} />
                      ))}
                      {hourSlots.map((h) => (
                        <div key={`m${h}`} className="absolute w-full border-t border-gray-50" style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2 }} />
                      ))}
                      {effectiveEvts.map((ev) => {
                        const cfg = ETYPE[ev.type];
                        const startMin = dragPreview[ev.id]?.startMin ?? ev.startMin;
                        const h = Math.max(ev.durationMin * PX_PER_MIN - 2, 10);
                        const isDragging = draggingId === ev.id;
                        return (
                          <div
                            key={ev.id}
                            data-band-id={band.id}
                            className={`absolute rounded border flex flex-col justify-center px-2 overflow-hidden ${canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                            style={{
                              top: minToY(startMin) + 1, left: 2, right: 2, height: h,
                              background: cfg.bg, borderColor: cfg.border, color: cfg.fg,
                              opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 20 : 1,
                              boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.2)" : undefined,
                            }}
                            onMouseDown={(e) => handleEventMouseDown(e, ev)}
                            onClick={(e) => handleEventClick(e, ev)}
                          >
                            <div className="text-xs font-semibold truncate leading-tight">{cfg.label}</div>
                            {h > 28 && <div className="text-xs opacity-70 leading-tight">{fmtTime(startMin)}–{fmtTime(startMin + ev.durationMin)}</div>}
                            {h > 48 && ev.note && <div className="text-xs opacity-55 truncate leading-tight">{ev.note}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

              {/* Single column */}
              {viewMode === "single" &&
                (() => {
                  const visibleEvts = events.filter((ev) => !hiddenBands.has(ev.eventBandId ?? ""));
                  const layout = assignSublanes(visibleEvts);
                  const colW = Math.max(BAND_COL_W * 2, 320);
                  return (
                    <div className="shrink-0 relative" style={{ width: colW, height: TOTAL_H }}>
                      {hourSlots.map((h) => (
                        <div key={h} className="absolute w-full border-t border-gray-100" style={{ top: (h - H_START) * HOUR_H }} />
                      ))}
                      {hourSlots.map((h) => (
                        <div key={`m${h}`} className="absolute w-full border-t border-gray-50" style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2 }} />
                      ))}
                      {visibleEvts.map((ev) => {
                        const bandIdx = bands.findIndex((b) => b.id === ev.eventBandId);
                        const bandColor = bandIdx >= 0 ? BAND_PALETTE[bandIdx % BAND_PALETTE.length] : STAFF_COLOR;
                        const cfg = ETYPE[ev.type];
                        const sl = layout.get(ev.id) ?? { lane: 0, totalLanes: 1 };
                        const slotW = colW / sl.totalLanes;
                        const evH = Math.max(ev.durationMin * PX_PER_MIN - 2, 10);
                        const bandName = bands.find((b) => b.id === ev.eventBandId)?.name ?? "スタッフ";
                        return (
                          <div
                            key={ev.id}
                            className="absolute rounded border flex flex-col justify-center px-2 overflow-hidden cursor-pointer"
                            style={{
                              top: minToY(ev.startMin) + 1,
                              left: sl.lane * slotW + 2,
                              width: slotW - 4,
                              height: evH,
                              background: cfg.bg,
                              borderColor: bandColor,
                              borderLeftWidth: 3,
                              color: cfg.fg,
                            }}
                            onClick={(e) => handleEventClick(e, ev)}
                          >
                            <div className="text-xs font-bold truncate leading-tight" style={{ color: bandColor }}>{bandName}</div>
                            <div className="text-xs font-semibold truncate leading-tight">{cfg.label}</div>
                            {evH > 36 && <div className="text-xs opacity-70 leading-tight">{fmtTime(ev.startMin)}–{fmtTime(ev.startMin + ev.durationMin)}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-400 text-center">
        {canEdit
          ? "列をクリック → 追加 ／ イベントをクリック → 編集 ／ 縦ドラッグ → 時間変更 ／ 横ドラッグ → バンド変更"
          : "閲覧専用モード"}
      </p>

      <TimelineEventModal
        modal={modal}
        bands={bands}
        onClose={() => setModal(CLOSED_MODAL)}
        onChange={(patch) => setModal((m) => ({ ...m, ...patch }))}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
