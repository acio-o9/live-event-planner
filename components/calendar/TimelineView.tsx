"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ---- Layout constants ----
const H_START = 10;
const H_END = 23;
const PX_PER_MIN = 2;
const HOUR_H = 60 * PX_PER_MIN;       // 120px / hour
const TOTAL_H = (H_END - H_START) * HOUR_H;
const TIME_COL_W = 56;
const BAND_COL_W = 160;
const HEADER_H = 44;
const SNAP_MIN = 10;
const DRAG_THRESHOLD_PX = 5;

// ---- Helpers ----
function minToY(min: number) { return min * PX_PER_MIN; }
function yToMin(py: number)  { return py / PX_PER_MIN; }
function snapMin(min: number) { return Math.round(min / SNAP_MIN) * SNAP_MIN; }
function clampMin(min: number, dur: number) {
  return Math.max(0, Math.min(min, (H_END - H_START) * 60 - dur));
}
function fmtTime(totalMin: number) {
  const abs = H_START * 60 + totalMin;
  return `${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

// ---- Data ----
const BAND_PALETTE = [
  "#6366f1","#ec4899","#f97316","#22c55e",
  "#3b82f6","#a855f7","#ef4444","#14b8a6",
];

const INITIAL_BANDS = [
  { id: "b1", name: "Band 1" },
  { id: "b2", name: "Band 2" },
  { id: "b3", name: "Band 3" },
  { id: "b4", name: "Band 4" },
  { id: "b5", name: "Band 5" },
  { id: "b6", name: "Band 6" },
  { id: "b7", name: "Band 7" },
  { id: "b8", name: "Band 8" },
];

type EventType = "rehearsal" | "performance" | "other";

const ETYPE: Record<EventType, { label: string; bg: string; border: string; fg: string }> = {
  rehearsal:   { label: "リハーサル", bg: "#fef9c3", border: "#fbbf24", fg: "#78350f" },
  performance: { label: "本番",       bg: "#dbeafe", border: "#60a5fa", fg: "#1e3a8a" },
  other:       { label: "その他",     bg: "#f3f4f6", border: "#9ca3af", fg: "#374151" },
};

const STAFF_BAND_ID = "__staff__";
const STAFF_COL_W = 180;
const STAFF_COLOR = "#6366f1";

interface TLEvent {
  id: string;
  bandId: string;
  type: EventType;
  startMin: number;
  durationMin: number;
  note: string;
}

interface DragPreview { startMin: number; bandId: string; }

let _uid = 0;
const uid = () => `e${++_uid}`;

function genReverseRehearsal(bands: { id: string }[]): TLEvent[] {
  const evts: TLEvent[] = [];
  [...bands].reverse().forEach((band, i) => {
    evts.push({ id: uid(), bandId: band.id, type: "rehearsal", startMin: i * 20, durationMin: 20, note: "逆リハ" });
  });
  const perfBase = (14 - H_START) * 60;
  bands.forEach((band, i) => {
    evts.push({ id: uid(), bandId: band.id, type: "performance", startMin: perfBase + i * 35, durationMin: 30, note: `${i + 1}番手` });
  });
  // スタッフ共通イベント
  evts.push({ id: uid(), bandId: STAFF_BAND_ID, type: "other", startMin: (13 - H_START) * 60,      durationMin: 30, note: "全体打ち合わせ" });
  evts.push({ id: uid(), bandId: STAFF_BAND_ID, type: "other", startMin: (13 - H_START) * 60 + 30, durationMin: 30, note: "開場 13:30" });
  evts.push({ id: uid(), bandId: STAFF_BAND_ID, type: "other", startMin: (19 - H_START) * 60,      durationMin: 120, note: "打ち上げ" });
  return evts;
}

// 重なりを検出してサブレーン番号を割り当てる
function assignSublanes(evts: TLEvent[]): Map<string, { lane: number; totalLanes: number }> {
  const sorted = [...evts].sort((a, b) => a.startMin - b.startMin);
  const laneEnds: number[] = [];
  const laneOf = new Map<string, number>();
  for (const ev of sorted) {
    let lane = laneEnds.findIndex(end => end <= ev.startMin);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = ev.startMin + ev.durationMin;
    laneOf.set(ev.id, lane);
  }
  const total = laneEnds.length || 1;
  const result = new Map<string, { lane: number; totalLanes: number }>();
  for (const [id, lane] of laneOf.entries()) result.set(id, { lane, totalLanes: total });
  return result;
}

// ---- Modal ----
interface ModalState {
  open: boolean; mode: "create" | "edit";
  eventId?: string; bandId: string; type: EventType;
  startMin: number; durationMin: number; note: string;
}
const CLOSED_MODAL: ModalState = {
  open: false, mode: "create", bandId: "", type: "rehearsal", startMin: 0, durationMin: 30, note: "",
};

export function TimelineView() {
  const [bands, setBands] = useState(INITIAL_BANDS);
  const [events, setEvents] = useState<TLEvent[]>([]);
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  const [editingBandId, setEditingBandId] = useState<string | null>(null);
  const [editingBandName, setEditingBandName] = useState("");
  const [hiddenBands, setHiddenBands] = useState<Set<string>>(new Set());

  const toggleBand = useCallback((id: string) => {
    setHiddenBands(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const allHidden = hiddenBands.size === bands.length;
  const toggleAll = () => setHiddenBands(allHidden ? new Set() : new Set(bands.map(b => b.id)));

  // Drag
  const dragRef = useRef<{
    eventId: string; origStart: number; origBandId: string;
    mouseY0: number; mouseX0: number;
  } | null>(null);
  const didDragRef = useRef(false);
  const [dragPreview, setDragPreview] = useState<Record<string, DragPreview>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"bands" | "single">("bands");
  const visibleBands = bands.filter(b => !hiddenBands.has(b.id));

  // ---- Global drag listeners ----
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dy = e.clientY - dragRef.current.mouseY0;
      const dx = e.clientX - dragRef.current.mouseX0;
      if (Math.abs(dy) > DRAG_THRESHOLD_PX || Math.abs(dx) > DRAG_THRESHOLD_PX) {
        didDragRef.current = true;
      }

      const ev = events.find(ev => ev.id === dragRef.current!.eventId);
      if (!ev) return;
      const newStart = snapMin(clampMin(dragRef.current.origStart + yToMin(dy), ev.durationMin));

      // Detect band column via data attribute on hovered element
      let newBandId = dragPreview[dragRef.current.eventId]?.bandId ?? dragRef.current.origBandId;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const col = el?.closest("[data-band-id]") as HTMLElement | null;
      if (col?.dataset.bandId) newBandId = col.dataset.bandId;

      setDragPreview({ [dragRef.current.eventId]: { startMin: newStart, bandId: newBandId } });
    };

    const onUp = () => {
      if (!dragRef.current) return;
      if (didDragRef.current) {
        const { eventId } = dragRef.current;
        const preview = dragPreview[eventId];
        if (preview) {
          setEvents(prev => prev.map(ev =>
            ev.id === eventId ? { ...ev, startMin: preview.startMin, bandId: preview.bandId } : ev
          ));
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
  }, [events, dragPreview]);

  // ---- Handlers ----
  const handleEventMouseDown = useCallback((e: React.MouseEvent, ev: TLEvent) => {
    e.stopPropagation();
    dragRef.current = { eventId: ev.id, origStart: ev.startMin, origBandId: ev.bandId, mouseY0: e.clientY, mouseX0: e.clientX };
    didDragRef.current = false;
    setDraggingId(ev.id);
  }, []);

  const handleEventClick = useCallback((e: React.MouseEvent, ev: TLEvent) => {
    e.stopPropagation();
    if (didDragRef.current) return;
    setModal({ open: true, mode: "edit", eventId: ev.id, bandId: ev.bandId, type: ev.type, startMin: ev.startMin, durationMin: ev.durationMin, note: ev.note });
  }, []);

  const handleColumnClick = useCallback((e: React.MouseEvent, bandId: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const rawMin = yToMin(e.clientY - rect.top);
    const startMin = Math.max(0, Math.min(snapMin(rawMin), (H_END - H_START) * 60 - 30));
    const defaultType: EventType = bandId === STAFF_BAND_ID ? "other" : "rehearsal";
    setModal({ open: true, mode: "create", bandId, type: defaultType, startMin, durationMin: 30, note: "" });
  }, []);

  const handleSave = () => {
    if (modal.mode === "create") {
      setEvents(prev => [...prev, { id: uid(), bandId: modal.bandId, type: modal.type, startMin: modal.startMin, durationMin: modal.durationMin, note: modal.note }]);
    } else if (modal.eventId) {
      setEvents(prev => prev.map(ev => ev.id === modal.eventId
        ? { ...ev, bandId: modal.bandId, type: modal.type, startMin: modal.startMin, durationMin: modal.durationMin, note: modal.note }
        : ev));
    }
    setModal(CLOSED_MODAL);
  };

  const handleDelete = () => {
    if (modal.eventId) setEvents(prev => prev.filter(ev => ev.id !== modal.eventId));
    setModal(CLOSED_MODAL);
  };

  const commitBandName = () => {
    if (editingBandId && editingBandName.trim()) {
      setBands(prev => prev.map(b => b.id === editingBandId ? { ...b, name: editingBandName.trim() } : b));
    }
    setEditingBandId(null);
  };

  // ---- Render ----
  const hourSlots = Array.from({ length: H_END - H_START }, (_, i) => H_START + i);
  const timeOptions = Array.from({ length: (H_END - H_START) * 6 }, (_, i) => i * 10);

  return (
    <div className="select-none">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <button
          onClick={() => setEvents(genReverseRehearsal(bands))}
          disabled={events.length > 0}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 disabled:hover:bg-indigo-600"
          title={events.length > 0 ? "クリアしてから生成してください" : ""}
        >
          叩きのタイムライン生成
        </button>
        <button
          onClick={() => { if (window.confirm("すべての予定を削除します。よろしいですか？")) setEvents([]); }}
          className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          クリア
        </button>
        <button
          onClick={() => setViewMode(v => v === "bands" ? "single" : "bands")}
          className={`px-4 py-2 text-sm rounded-lg border font-medium transition-colors ${
            viewMode === "single"
              ? "bg-gray-800 text-white border-gray-800"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {viewMode === "single" ? "バンド別に戻す" : "一列表示"}
        </button>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {(Object.entries(ETYPE) as [EventType, typeof ETYPE[EventType]][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border" style={{ background: v.bg, borderColor: v.border }} />
              <span className="text-xs text-gray-500">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Band filter */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={toggleAll}
          className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-all font-medium">
          {allHidden ? "全表示" : "全非表示"}
        </button>
        {bands.map((band, idx) => {
          const color = BAND_PALETTE[idx % BAND_PALETTE.length];
          const visible = !hiddenBands.has(band.id);
          return (
            <button key={band.id} onClick={() => toggleBand(band.id)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-all font-medium"
              style={visible
                ? { background: color + "20", borderColor: color, color }
                : { background: "#f3f4f6", borderColor: "#d1d5db", color: "#9ca3af" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: visible ? color : "#d1d5db" }} />
              {band.name}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow bg-white">
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 640 }}>
          <div style={{ minWidth: TIME_COL_W + STAFF_COL_W + (viewMode === "bands" ? visibleBands.length * BAND_COL_W : Math.max(BAND_COL_W * 2, 320)), display: "flex", flexDirection: "column" }}>

            {/* Sticky header: band names */}
            <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200">
              {/* Corner */}
              <div className="shrink-0 sticky left-0 z-30 bg-gray-50 border-r border-gray-200"
                style={{ width: TIME_COL_W, height: HEADER_H }} />
              {/* スタッフ共通列ヘッダー (常時表示) */}
              <div className="shrink-0 border-r-2 flex items-center gap-2 px-3"
                style={{ width: STAFF_COL_W, height: HEADER_H, borderColor: STAFF_COLOR, background: "#eef2ff" }}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STAFF_COLOR }} />
                <span className="text-sm font-semibold" style={{ color: STAFF_COLOR }}>スタッフ共通</span>
              </div>

              {/* Band name cells */}
              {viewMode === "single" && (
                <div className="shrink-0 border-r border-gray-200 flex items-center px-3"
                  style={{ width: Math.max(BAND_COL_W * 2, 320), height: HEADER_H }}>
                  <span className="text-sm font-medium text-gray-700">全バンド（一列表示）</span>
                </div>
              )}
              {viewMode === "bands" && visibleBands.map((band) => {
                const origIdx = bands.indexOf(band);
                const color = BAND_PALETTE[origIdx % BAND_PALETTE.length];
                return (
                  <div key={band.id} className="shrink-0 border-r border-gray-200 last:border-r-0 flex items-center px-3"
                    style={{ width: BAND_COL_W, height: HEADER_H }}>
                    <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ background: color }} />
                    {editingBandId === band.id ? (
                      <input autoFocus value={editingBandName}
                        onChange={e => setEditingBandName(e.target.value)}
                        onBlur={commitBandName}
                        onKeyDown={e => { if (e.key === "Enter") commitBandName(); if (e.key === "Escape") setEditingBandId(null); }}
                        className="w-full text-sm border-b border-blue-400 outline-none bg-transparent" />
                    ) : (
                      <span className="text-sm font-medium text-gray-700 truncate cursor-text"
                        onDoubleClick={() => { setEditingBandId(band.id); setEditingBandName(band.name); }}
                        title="ダブルクリックで名前を変更">
                        {band.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Body: time col + band cols */}
            <div className="flex">
              {/* Time label column (sticky left) */}
              <div className="shrink-0 sticky left-0 z-10 bg-gray-50 border-r border-gray-200"
                style={{ width: TIME_COL_W }}>
                <div style={{ height: TOTAL_H, position: "relative" }}>
                  {hourSlots.map(h => (
                    <div key={h} className="absolute w-full flex justify-end pr-2"
                      style={{ top: (h - H_START) * HOUR_H }}>
                      <span className="text-xs text-gray-400 leading-none">{String(h).padStart(2, "0")}:00</span>
                    </div>
                  ))}
                  {/* 30min ticks */}
                  {hourSlots.map(h => (
                    <div key={`m${h}`} className="absolute w-full flex justify-end pr-2"
                      style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2 }}>
                      <span className="text-xs text-gray-300 leading-none">:30</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* スタッフ共通列 (常時表示) */}
              {(() => {
                const staffEvts = events.filter(ev => ev.bandId === STAFF_BAND_ID);
                return (
                  <div
                    data-band-id={STAFF_BAND_ID}
                    className="shrink-0 relative cursor-crosshair"
                    style={{ width: STAFF_COL_W, height: TOTAL_H, background: "#f5f3ff", borderRight: `2px solid ${STAFF_COLOR}40` }}
                    onClick={e => handleColumnClick(e, STAFF_BAND_ID)}>
                    {hourSlots.map(h => (
                      <div key={h} className="absolute w-full border-t" style={{ top: (h - H_START) * HOUR_H, borderColor: `${STAFF_COLOR}20` }} />
                    ))}
                    {hourSlots.map(h => (
                      <div key={`m${h}`} className="absolute w-full border-t" style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2, borderColor: `${STAFF_COLOR}10` }} />
                    ))}
                    {staffEvts.map(ev => {
                      const startMin = dragPreview[ev.id]?.startMin ?? ev.startMin;
                      const evH = Math.max(ev.durationMin * PX_PER_MIN - 2, 10);
                      const isDragging = draggingId === ev.id;
                      return (
                        <div key={ev.id}
                          data-band-id={STAFF_BAND_ID}
                          className="absolute rounded flex flex-col justify-center px-2 overflow-hidden cursor-grab active:cursor-grabbing"
                          style={{
                            top: minToY(startMin) + 1, left: 2, right: 2, height: evH,
                            background: "#ede9fe", borderLeft: `3px solid ${STAFF_COLOR}`,
                            color: "#4c1d95", opacity: isDragging ? 0.7 : 1,
                            zIndex: isDragging ? 20 : 1,
                            boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.2)" : undefined,
                          }}
                          onMouseDown={e => handleEventMouseDown(e, ev)}
                          onClick={e => handleEventClick(e, ev)}>
                          <div className="text-xs font-semibold truncate leading-tight">{ev.note || "タスク"}</div>
                          {evH > 28 && <div className="text-xs opacity-70 leading-tight">{fmtTime(startMin)}–{fmtTime(startMin + ev.durationMin)}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Band columns (bands mode) */}
              {viewMode === "bands" && visibleBands.map((band) => {
                const effectiveEvts = events.filter(ev => {
                  const effectiveBand = dragPreview[ev.id]?.bandId ?? ev.bandId;
                  return effectiveBand === band.id;
                });
                return (
                  <div key={band.id}
                    data-band-id={band.id}
                    className="shrink-0 border-r border-gray-200 last:border-r-0 relative cursor-crosshair"
                    style={{ width: BAND_COL_W, height: TOTAL_H }}
                    onClick={e => handleColumnClick(e, band.id)}>
                    {hourSlots.map(h => (
                      <div key={h} className="absolute w-full border-t border-gray-100" style={{ top: (h - H_START) * HOUR_H }} />
                    ))}
                    {hourSlots.map(h => (
                      <div key={`m${h}`} className="absolute w-full border-t border-gray-50" style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2 }} />
                    ))}
                    {effectiveEvts.map(ev => {
                      const cfg = ETYPE[ev.type];
                      const startMin = dragPreview[ev.id]?.startMin ?? ev.startMin;
                      const h = Math.max(ev.durationMin * PX_PER_MIN - 2, 10);
                      const isDragging = draggingId === ev.id;
                      return (
                        <div key={ev.id}
                          data-band-id={band.id}
                          className="absolute rounded border flex flex-col justify-center px-2 overflow-hidden cursor-grab active:cursor-grabbing"
                          style={{
                            top: minToY(startMin) + 1, left: 2, right: 2, height: h,
                            background: cfg.bg, borderColor: cfg.border, color: cfg.fg,
                            opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 20 : 1,
                            boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.2)" : undefined,
                          }}
                          onMouseDown={e => handleEventMouseDown(e, ev)}
                          onClick={e => handleEventClick(e, ev)}>
                          <div className="text-xs font-semibold truncate leading-tight">{cfg.label}</div>
                          {h > 28 && <div className="text-xs opacity-70 leading-tight">{fmtTime(startMin)}–{fmtTime(startMin + ev.durationMin)}</div>}
                          {h > 48 && ev.note && <div className="text-xs opacity-55 truncate leading-tight">{ev.note}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Single column (all events merged) */}
              {viewMode === "single" && (() => {
                const visibleEvts = events.filter(ev => !hiddenBands.has(ev.bandId));
                const layout = assignSublanes(visibleEvts);
                const colW = Math.max(BAND_COL_W * 2, 320);
                return (
                  <div className="shrink-0 relative" style={{ width: colW, height: TOTAL_H }}>
                    {hourSlots.map(h => (
                      <div key={h} className="absolute w-full border-t border-gray-100" style={{ top: (h - H_START) * HOUR_H }} />
                    ))}
                    {hourSlots.map(h => (
                      <div key={`m${h}`} className="absolute w-full border-t border-gray-50" style={{ top: (h - H_START) * HOUR_H + HOUR_H / 2 }} />
                    ))}
                    {visibleEvts.map(ev => {
                      const bandIdx = bands.findIndex(b => b.id === ev.bandId);
                      const bandColor = BAND_PALETTE[bandIdx % BAND_PALETTE.length];
                      const cfg = ETYPE[ev.type];
                      const sl = layout.get(ev.id) ?? { lane: 0, totalLanes: 1 };
                      const slotW = colW / sl.totalLanes;
                      const startMin = ev.startMin;
                      const evH = Math.max(ev.durationMin * PX_PER_MIN - 2, 10);
                      const isDragging = draggingId === ev.id;
                      const bandName = bands.find(b => b.id === ev.bandId)?.name ?? "";
                      return (
                        <div key={ev.id}
                          className="absolute rounded border flex flex-col justify-center px-2 overflow-hidden cursor-pointer"
                          style={{
                            top: minToY(startMin) + 1,
                            left: sl.lane * slotW + 2,
                            width: slotW - 4,
                            height: evH,
                            background: cfg.bg,
                            borderColor: bandColor,
                            borderLeftWidth: 3,
                            color: cfg.fg,
                            opacity: isDragging ? 0.7 : 1,
                            zIndex: isDragging ? 20 : 1,
                          }}
                          onClick={e => handleEventClick(e, ev)}>
                          <div className="text-xs font-bold truncate leading-tight" style={{ color: bandColor }}>{bandName}</div>
                          <div className="text-xs font-semibold truncate leading-tight">{cfg.label}</div>
                          {evH > 36 && <div className="text-xs opacity-70 leading-tight">{fmtTime(startMin)}–{fmtTime(startMin + ev.durationMin)}</div>}
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
        列をクリック → 追加 ／ イベントをクリック → 編集 ／ 縦ドラッグ → 時間変更 ／ 横ドラッグ → バンド変更 ／ バンド名をダブルクリック → 名前変更
      </p>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setModal(CLOSED_MODAL)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold mb-4">{modal.mode === "create" ? "予定を追加" : "予定を編集"}</h2>
            <div className="space-y-4">
              {/* Band (スタッフ列以外) */}
              {modal.bandId !== STAFF_BAND_ID && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">バンド</label>
                  <select value={modal.bandId} onChange={e => setModal(m => ({ ...m, bandId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              {/* Type (バンド列のみ) */}
              {modal.bandId !== STAFF_BAND_ID && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">種別</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.entries(ETYPE) as [EventType, typeof ETYPE[EventType]][]).map(([k, v]) => (
                      <button key={k} onClick={() => setModal(m => ({ ...m, type: k }))}
                        className="px-3 py-2 text-xs rounded-lg border-2 font-medium transition-all text-left"
                        style={modal.type === k
                          ? { background: v.bg, borderColor: v.border, color: v.fg }
                          : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Start time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">開始時刻</label>
                <select value={modal.startMin} onChange={e => setModal(m => ({ ...m, startMin: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {timeOptions.map(min => <option key={min} value={min}>{fmtTime(min)}</option>)}
                </select>
              </div>
              {/* Duration */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">時間</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[10, 15, 20, 25, 30].map(d => (
                    <button key={d} onClick={() => setModal(m => ({ ...m, durationMin: d }))}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                        modal.durationMin === d ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                      {d}分
                    </button>
                  ))}
                </div>
              </div>
              {/* Note */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
                <input type="text" value={modal.note} onChange={e => setModal(m => ({ ...m, note: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: PAチェックあり" />
              </div>
            </div>
            <div className="flex justify-between mt-5">
              {modal.mode === "edit"
                ? <button onClick={handleDelete} className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors">削除</button>
                : <div />}
              <div className="flex gap-2">
                <button onClick={() => setModal(CLOSED_MODAL)} className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">キャンセル</button>
                <button onClick={handleSave} className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
