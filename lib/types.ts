// ============================================================
// Domain Model Types
// ============================================================

// ユーザー（OIDCトークンのsubjectで識別。個人情報は持たない）
export interface User {
  id: string;
  sub: string;
  nickname: string;
  avatarUrl?: string;
  instruments: Instrument[];
  deletedAt: string | null;
  createdAt: string;
}

export interface Instrument {
  id: string;
  name: string;
  order: number;
}

export interface ProfileUpdateFormData {
  nickname: string;
  instrumentIds: string[];
}

// ============================================================
// Live Event
// ============================================================

export type LiveEventDetailTab = "bands" | "milestones" | "expenses";

export interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  date?: string; // 開催予定日（未定の場合はundefined）
  venue?: string;
  photoAlbumUrl?: string; // Google フォトアルバムURL
  bands: EventBand[];
  milestones: Milestone[];
  status: "planning" | "confirmed" | "completed" | "cancelled";
  createdBy: string; // User.id
  createdAt: string;
  updatedAt: string;
}

// イベント専属バンド
export interface EventBand {
  id: string;
  liveEventId: string;
  name: string;
  description?: string;
  members: EventBandMember[];
  memberSnapshot: MemberSnapshot[]; // 参加確定時点のメンバースナップショット
  setlist: Setlist;
  snapshotTakenAt?: string; // スナップショット取得日時（未確定の場合はundefined）
}

export interface EventBandMember {
  userId: string; // User.id への参照
  user: User;
  role: "leader" | "member";
  joinedAt: string;
}

// メンバースナップショット（参加確定時点の記録）
export interface MemberSnapshot {
  userId: string;
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
  eventBandId?: string; // undefinedならライブ全体タスク、あればバンド個別タスク
  title: string;
  assigneeUserId?: string; // 担当者（User.id）。未アサインも可
  status: "pending" | "in_progress" | "completed";
  order: number;
}

// ============================================================
// Setlist
// ============================================================

export interface Setlist {
  id: string;
  eventBandId: string; // EventBand.id への参照
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

// --- EventBand ---

export interface CreateEventBandRequest {
  name: string;
  description?: string;
}

export interface UpdateEventBandRequest {
  name?: string;
  description?: string;
}

export interface AddEventBandMemberRequest {
  userId: string;
  role: "leader" | "member";
}

export interface UpdateBandLeaderRequest {
  userId: string;
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

export interface CreateMilestoneRequest {
  title: string;
  dueDate?: string;
}

export interface UpdateMilestoneRequest {
  title?: string;
  dueDate?: string;
  status?: Milestone["status"];
}

// --- Task ---

export interface CreateTaskRequest {
  title: string;
  eventBandId?: string;
  assigneeUserId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  assigneeUserId?: string | null;
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
  paidBy: string;       // User.id
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
    userId: string;
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
  eventBandId: string;
  bandName: string;
  location: string;
  startAt: string;  // ISO8601
  endAt: string;    // ISO8601
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBandScheduleRequest {
  eventBandId: string;
  location: string;
  startAt: string;
  endAt: string;
}


// --- API Error ---

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}
