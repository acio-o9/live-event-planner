/**
 * 型定義の構造テスト
 * 型のコンパイルチェックおよびデータ整合性テスト
 */
import {
  User,
  EventBand,
  LiveEvent,
  MemberSnapshot,
  Milestone,
  Task,
  Setlist,
  SetlistSong,
} from "../types";

describe("ドメインモデル型定義", () => {
  describe("User", () => {
    it("必須フィールドのみで作成できる", () => {
      const user: User = {
        id: "uuid-1",
        sub: "google-sub-12345",
        nickname: "テストユーザー",
        instruments: [],
        createdAt: new Date().toISOString(),
      };
      expect(user.sub).toBe("google-sub-12345");
      // email フィールドは型定義に存在しない（個人情報を持たない設計）
      expect("email" in user).toBe(false);
    });

    it("avatarUrl はオプショナル", () => {
      const userWithAvatar: User = {
        id: "uuid-2",
        sub: "sub-1",
        nickname: "Alice",
        avatarUrl: "https://example.com/avatar.jpg",
        instruments: [],
        createdAt: new Date().toISOString(),
      };
      expect(userWithAvatar.avatarUrl).toBeDefined();
    });
  });

  describe("LiveEvent", () => {
    it("date と venue はオプショナル（未定の場合）", () => {
      const event: LiveEvent = {
        id: "event-1",
        title: "第1回ライブ",
        bands: [],
        milestones: [],
        status: "planning",
        createdBy: "user-sub-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(event.date).toBeUndefined();
      expect(event.venue).toBeUndefined();
      expect(event.photoAlbumUrl).toBeUndefined();
    });

    it("status は定義済みの値のみ受け付ける", () => {
      const statuses: LiveEvent["status"][] = [
        "planning",
        "confirmed",
        "completed",
        "cancelled",
      ];
      expect(statuses).toHaveLength(4);
    });
  });

  describe("EventBand（スナップショットパターン）", () => {
    it("snapshotTakenAt はオプショナル（確定前はundefined）", () => {
      const eventBand: Partial<EventBand> = {
        id: "eb-1",
        liveEventId: "event-1",
        name: "テストバンド",
        memberSnapshot: [],
      };
      expect(eventBand.snapshotTakenAt).toBeUndefined();
    });

    it("MemberSnapshot は userId・nickname・role を持つ", () => {
      const snapshot: MemberSnapshot = {
        userId: "user-id-1",
        nickname: "Alice (当時)",
        role: "leader",
      };
      expect(snapshot.userId).toBeDefined();
      expect(snapshot.nickname).toBeDefined();
    });
  });

  describe("Milestone と Task", () => {
    it("Milestone.dueDate はオプショナル", () => {
      const milestone: Partial<Milestone> = {
        id: "ms-1",
        title: "バンド参加申し込み締め切り",
        status: "pending",
        order: 1,
        tasks: [],
      };
      expect(milestone.dueDate).toBeUndefined();
    });

    it("Task.eventBandId がundefinedの場合はライブ全体タスク", () => {
      const eventTask: Task = {
        id: "task-1",
        milestoneId: "ms-1",
        title: "告知サイト作成",
        status: "pending",
        order: 1,
      };
      expect(eventTask.eventBandId).toBeUndefined();
    });

    it("Task.eventBandId が指定されている場合はバンド個別タスク", () => {
      const bandTask: Task = {
        id: "task-2",
        milestoneId: "ms-1",
        eventBandId: "eb-1",
        title: "PA表提出",
        status: "pending",
        order: 1,
      };
      expect(bandTask.eventBandId).toBe("eb-1");
    });

    it("Task.assigneeUserId はオプショナル（未アサイン可）", () => {
      const task: Task = {
        id: "task-3",
        milestoneId: "ms-1",
        title: "未アサインタスク",
        status: "pending",
        order: 1,
      };
      expect(task.assigneeUserId).toBeUndefined();
    });
  });

  describe("Setlist", () => {
    it("eventBandId で EventBand に紐付く", () => {
      const setlist: Setlist = {
        id: "setlist-1",
        eventBandId: "eb-1",
        songs: [],
        updatedAt: new Date().toISOString(),
      };
      expect(setlist.eventBandId).toBe("eb-1");
    });

    it("SetlistSong.duration と note はオプショナル", () => {
      const song: SetlistSong = {
        order: 1,
        title: "テスト曲",
      };
      expect(song.duration).toBeUndefined();
      expect(song.note).toBeUndefined();
    });
  });
});
