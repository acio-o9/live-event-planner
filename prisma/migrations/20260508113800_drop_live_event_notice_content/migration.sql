-- AlterTable: drop noticeContent (data already migrated to LiveEventNotice)
ALTER TABLE "LiveEvent" DROP COLUMN "noticeContent";
