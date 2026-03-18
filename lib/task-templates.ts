import { TaskTemplate } from "./types";

// マイルストーンの order 定義（design.md のマイルストーン順に対応）
export const MILESTONE_ORDER = {
  BAND_APPLICATION: 1, // バンド参加申し込み締め切り (-60日)
  SETLIST_SUBMISSION: 2, // セットリスト提出締め切り    (-30日)
  REHEARSAL_SCHEDULE: 3, // リハーサル日程確定           (-21日)
  VENUE_CHECK: 4, // 会場・機材確認               (-14日)
  FINAL_REHEARSAL: 5, // 最終リハーサル               (-7日)
  EVENT_DAY: 6, // 当日準備・リハーサル          (0日)
} as const;

// マイルストーン定義（ライブ作成時に自動生成）
export const MILESTONE_TEMPLATES = [
  { order: MILESTONE_ORDER.BAND_APPLICATION, title: "バンド参加申し込み締め切り", offsetDays: -60 },
  { order: MILESTONE_ORDER.SETLIST_SUBMISSION, title: "セットリスト提出締め切り", offsetDays: -30 },
  { order: MILESTONE_ORDER.REHEARSAL_SCHEDULE, title: "リハーサル日程確定", offsetDays: -21 },
  { order: MILESTONE_ORDER.VENUE_CHECK, title: "会場・機材確認", offsetDays: -14 },
  { order: MILESTONE_ORDER.FINAL_REHEARSAL, title: "最終リハーサル", offsetDays: -7 },
  { order: MILESTONE_ORDER.EVENT_DAY, title: "当日準備・リハーサル", offsetDays: 0 },
] as const;

// ライブ全体タスクのデフォルトテンプレート（ライブ作成時に自動生成）
export const EVENT_TASK_TEMPLATES: TaskTemplate[] = [
  { milestoneOrder: MILESTONE_ORDER.BAND_APPLICATION, title: "告知用サイト作成", scope: "event" },
  { milestoneOrder: MILESTONE_ORDER.SETLIST_SUBMISSION, title: "ライブTシャツ手配", scope: "event" },
  { milestoneOrder: MILESTONE_ORDER.VENUE_CHECK, title: "会場・機材確認連絡", scope: "event" },
  { milestoneOrder: MILESTONE_ORDER.EVENT_DAY, title: "打ち上げ用デリバリー手配", scope: "event" },
];

// バンド個別タスクのデフォルトテンプレート（バンド参加時に自動生成）
export const BAND_TASK_TEMPLATES: TaskTemplate[] = [
  { milestoneOrder: MILESTONE_ORDER.SETLIST_SUBMISSION, title: "PA表提出", scope: "band" },
  { milestoneOrder: MILESTONE_ORDER.FINAL_REHEARSAL, title: "セットリスト最終確認", scope: "band" },
];

// 開催日から各マイルストーンの期限を計算するユーティリティ
export function calcDueDate(eventDate: string, offsetDays: number): string {
  const date = new Date(eventDate);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}
