-- Migration: event_scoped_bands
-- Band/BandMember/LiveEventBand を削除し、EventBand/EventBandMember を新設

-- 1. 既存の依存テーブルを削除（CASCADE で関連FK制約ごと落とす）
DROP TABLE IF EXISTS "MemberSnapshot" CASCADE;
DROP TABLE IF EXISTS "Setlist" CASCADE;
DROP TABLE IF EXISTS "SetlistSong" CASCADE;
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "BandSchedule" CASCADE;
DROP TABLE IF EXISTS "LiveEventBand" CASCADE;
DROP TABLE IF EXISTS "BandMember" CASCADE;
DROP TABLE IF EXISTS "Band" CASCADE;

-- 2. EventBand（イベント専属バンド）
CREATE TABLE "EventBand" (
    "id"          TEXT NOT NULL,
    "liveEventId" TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "createdBy"   TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBand_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EventBand_liveEventId_fkey" FOREIGN KEY ("liveEventId")
        REFERENCES "LiveEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventBand_createdBy_fkey" FOREIGN KEY ("createdBy")
        REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. EventBandMember
CREATE TABLE "EventBandMember" (
    "eventBandId" TEXT NOT NULL,
    "userSub"     TEXT NOT NULL,
    "role"        TEXT NOT NULL DEFAULT 'member',
    "joinedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventBandMember_pkey" PRIMARY KEY ("eventBandId", "userSub"),
    CONSTRAINT "EventBandMember_eventBandId_fkey" FOREIGN KEY ("eventBandId")
        REFERENCES "EventBand"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventBandMember_userSub_fkey" FOREIGN KEY ("userSub")
        REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. BandSchedule（eventBandId に紐づく）
CREATE TABLE "BandSchedule" (
    "id"          TEXT NOT NULL,
    "eventBandId" TEXT NOT NULL,
    "location"    TEXT NOT NULL,
    "startAt"     TIMESTAMP(3) NOT NULL,
    "endAt"       TIMESTAMP(3) NOT NULL,
    "createdBy"   TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BandSchedule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BandSchedule_eventBandId_fkey" FOREIGN KEY ("eventBandId")
        REFERENCES "EventBand"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BandSchedule_createdBy_fkey" FOREIGN KEY ("createdBy")
        REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. MemberSnapshot（eventBandId に紐づく）
CREATE TABLE "MemberSnapshot" (
    "id"          TEXT NOT NULL,
    "eventBandId" TEXT NOT NULL,
    "userSub"     TEXT NOT NULL,
    "nickname"    TEXT NOT NULL,
    "role"        TEXT NOT NULL,
    "takenAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberSnapshot_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MemberSnapshot_eventBandId_fkey" FOREIGN KEY ("eventBandId")
        REFERENCES "EventBand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Task（eventBandId に紐づく、nullable）
CREATE TABLE "Task" (
    "id"              TEXT NOT NULL,
    "milestoneId"     TEXT NOT NULL,
    "eventBandId"     TEXT,
    "title"           TEXT NOT NULL,
    "assigneeUserSub" TEXT,
    "status"          TEXT NOT NULL DEFAULT 'pending',
    "order"           INTEGER NOT NULL,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId")
        REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_eventBandId_fkey" FOREIGN KEY ("eventBandId")
        REFERENCES "EventBand"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeUserSub_fkey" FOREIGN KEY ("assigneeUserSub")
        REFERENCES "User"("sub") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. Setlist（eventBandId に紐づく）
CREATE TABLE "Setlist" (
    "id"          TEXT NOT NULL,
    "eventBandId" TEXT NOT NULL,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setlist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Setlist_eventBandId_key" UNIQUE ("eventBandId"),
    CONSTRAINT "Setlist_eventBandId_fkey" FOREIGN KEY ("eventBandId")
        REFERENCES "EventBand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. SetlistSong（変更なし）
CREATE TABLE "SetlistSong" (
    "id"        TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "duration"  INTEGER,
    "order"     INTEGER NOT NULL,
    "note"      TEXT,

    CONSTRAINT "SetlistSong_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SetlistSong_setlistId_fkey" FOREIGN KEY ("setlistId")
        REFERENCES "Setlist"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
