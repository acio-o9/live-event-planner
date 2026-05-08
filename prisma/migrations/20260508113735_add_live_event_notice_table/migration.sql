-- CreateTable
CREATE TABLE "LiveEventNotice" (
    "liveEventId" TEXT NOT NULL,
    "content" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "LiveEventNotice_pkey" PRIMARY KEY ("liveEventId")
);

-- MigrateData: copy existing noticeContent → LiveEventNotice
INSERT INTO "LiveEventNotice" ("liveEventId", "content", "updatedAt")
SELECT "id", "noticeContent", NOW()
FROM "LiveEvent"
WHERE "noticeContent" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "LiveEventNotice" ADD CONSTRAINT "LiveEventNotice_liveEventId_fkey" FOREIGN KEY ("liveEventId") REFERENCES "LiveEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveEventNotice" ADD CONSTRAINT "LiveEventNotice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
