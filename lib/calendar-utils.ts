import type { BandSchedule } from "@/lib/types";

/**
 * 指定月のカレンダーグリッド用日付配列を生成（42マス固定）
 */
export function buildCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(year, month, 1 - (firstDay.getDay() - i)));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
}

/**
 * 指定日付のスケジュールをフィルタリング（startAt の日付で判定）
 */
export function schedulesForDate(schedules: BandSchedule[], date: Date): BandSchedule[] {
  return schedules.filter((s) => {
    const start = new Date(s.startAt);
    return (
      start.getFullYear() === date.getFullYear() &&
      start.getMonth() === date.getMonth() &&
      start.getDate() === date.getDate()
    );
  });
}

/**
 * bandId のハッシュから HSL 背景色を生成
 */
export function bandColor(bandId: string): string {
  let hash = 0;
  for (let i = 0; i < bandId.length; i++) {
    hash = bandId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 88%)`;
}
