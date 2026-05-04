export const H_START = 10;
export const H_END = 23;
export const PX_PER_MIN = 2;
export const HOUR_H = 60 * PX_PER_MIN;
export const TOTAL_H = (H_END - H_START) * HOUR_H;
export const TIME_COL_W = 56;
export const BAND_COL_W = 160;
export const STAFF_COL_W = 180;
export const HEADER_H = 44;
export const SNAP_MIN = 10;
export const DRAG_THRESHOLD_PX = 5;
export const STAFF_BAND_ID = "__staff__";
export const STAFF_COLOR = "#6366f1";

export const BAND_PALETTE = [
  "#6366f1", "#ec4899", "#f97316", "#22c55e",
  "#3b82f6", "#a855f7", "#ef4444", "#14b8a6",
];

export type TLEventType = "rehearsal" | "performance" | "other";

export const ETYPE: Record<TLEventType, { label: string; bg: string; border: string; fg: string }> = {
  rehearsal:   { label: "リハーサル", bg: "#fef9c3", border: "#fbbf24", fg: "#78350f" },
  performance: { label: "本番",       bg: "#dbeafe", border: "#60a5fa", fg: "#1e3a8a" },
  other:       { label: "その他",     bg: "#f3f4f6", border: "#9ca3af", fg: "#374151" },
};

export function minToY(min: number) { return min * PX_PER_MIN; }
export function yToMin(py: number)  { return py / PX_PER_MIN; }
export function snapMin(min: number) { return Math.round(min / SNAP_MIN) * SNAP_MIN; }
export function clampMin(min: number, dur: number) {
  return Math.max(0, Math.min(min, (H_END - H_START) * 60 - dur));
}
export function fmtTime(totalMin: number) {
  const abs = H_START * 60 + totalMin;
  return `${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}
