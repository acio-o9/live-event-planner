// ============================================================
// Domain Model Types
// ============================================================

// ユーザー（OIDCトークンのsubjectで識別。個人情報は持たない）
export interface User {
  sub: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: string;
}

// ============================================================
// Band
// ============================================================

export interface Band {
  id: string;
  name: string;
  description?: string;
  members: BandMember[];
  createdAt: string;
  updatedAt: string;
}

export interface BandMember {
  userSub: string; // User.sub への参照
  user: User;
  role: "leader" | "member";
  joinedAt: string;
}

// ============================================================
// Live Event
// ============================================================

export interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  date?: string; // 開催予定日（未定の場合はundefined）
  venue?: string;
  photoAlbumUrl?: string; // Google フォトアルバムURL
  bands: LiveEventBand[];
  milestones: Milestone[];
  status: "planning" | "confirmed" | "completed" | "cancelled";
  createdBy: string; // User.sub
  createdAt: string;
  updatedAt: string;
}

// ライブ×バンドの参加記録（中間エンティティ）
export interface LiveEventBand {
  id: string;
  liveEventId: string;
  bandId: string;
  band: Band; // 現在のバンド情報（表示用参照）
  memberSnapshot: MemberSnapshot[]; // 参加確定時点のメンバースナップショット
  setlist: Setlist;
  snapshotTakenAt?: string; // スナップショット取得日時（未確定の場合はundefined）
}

// メンバースナップショット（参加確定時点の記録）
export interface MemberSnapshot {
  userSub: string;
  nickname: string; // 当時の表示名も保存
  role: "leader" | "member";
}

// ============================================================
// Milestone & Task
// ============================================================

export interface Milestone {
  id: string;
  liveEventId: string;
  title: string;
  dueDate?: string; // 開催予定日が未定の場合はundefined
  status: "pending" | "in_progress" | "completed";
  order: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  milestoneId: string;
  liveEventBandId?: string; // undefinedならライブ全体タスク、あればバンド個別タスク
  title: string;
  assigneeUserSub?: string; // 担当者（User.sub）。未アサインも可
  status: "pending" | "in_progress" | "completed";
  order: number;
}

// ============================================================
// Setlist
// ============================================================

export interface Setlist {
  id: string;
  liveEventBandId: string; // LiveEventBand.id への参照
  songs: SetlistSong[];
  updatedAt: string;
}

export interface SetlistSong {
  order: number;
  title: string;
  duration?: number; // 秒数
  note?: string;
}

// ============================================================
// Task Template（コード定義。DBには持たない）
// ============================================================

export type TaskScope = "event" | "band";

export interface TaskTemplate {
  milestoneOrder: number; // Milestone.order との対応
  title: string;
  scope: TaskScope;
}

// ============================================================
// Permission（将来実装予定。現在は使用しない）
// ============================================================

// type Permission =
//   | 'live-event:view'
//   | 'live-event:create'
//   | 'live-event:edit'
//   | 'live-event:delete'
//   | 'band:view'
//   | 'band:create'
//   | 'band:edit'
//   | 'band:delete'
//   | 'setlist:edit';

// ============================================================
// API Request / Response Types
// ============================================================

// --- Band ---

export interface CreateBandRequest {
  name: string;
  description?: string;
}

export interface UpdateBandRequest {
  name?: string;
  description?: string;
}

export interface AddBandMemberRequest {
  userSub: string;
  role: "leader" | "member";
}

// --- Live Event ---

export interface CreateLiveEventRequest {
  title: string;
  description?: string;
  date?: string;
  venue?: string;
}

export interface UpdateLiveEventRequest {
  title?: string;
  description?: string;
  date?: string;
  venue?: string;
  photoAlbumUrl?: string;
  status?: LiveEvent["status"];
}

export interface UpdateMilestoneRequest {
  title?: string;
  dueDate?: string;
  status?: Milestone["status"];
}

// --- LiveEventBand ---

export interface AddLiveEventBandRequest {
  bandId: string;
}

// --- Task ---

export interface CreateTaskRequest {
  title: string;
  liveEventBandId?: string;
  assigneeUserSub?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  assigneeUserSub?: string | null;
  status?: Task["status"];
}

// --- Setlist ---

export interface UpdateSetlistRequest {
  songs: SetlistSong[];
}

// --- Expense ---

export interface Expense {
  id: string;
  liveEventId: string;
  paidBy: string;       // User.sub
  paidByName: string;   // 表示用ニックネーム
  amount: number;       // 金額（円）
  category: string;     // 会場費・機材費・飲食費・その他
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  paidBy: string;
  amount: number;
  category: string;
  description: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  participantCount: number;
  perPersonAmount: number;
  breakdown: {
    userSub: string;
    nickname: string;
    paidAmount: number;
    balance: number; // 正: 受け取り、負: 支払い
  }[];
}

export interface CreateExpenseRequest {
  paidBy: string;
  amount: number;
  category: string;
  description?: string;
}

export interface UpdateExpenseRequest {
  paidBy?: string;
  amount?: number;
  category?: string;
  description?: string;
}

// --- BandSchedule ---

export interface BandSchedule {
  id: string;
  bandId: string;
  bandName: string;
  location: string;
  startAt: string;  // ISO8601
  endAt: string;    // ISO8601
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBandScheduleRequest {
  bandId: string;
  location: string;
  startAt: string;
  endAt: string;
}

// --- API Error ---

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}
