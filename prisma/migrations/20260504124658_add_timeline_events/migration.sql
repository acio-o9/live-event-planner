/*
  Warnings:

  - You are about to drop the `BandSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BandSchedule" DROP CONSTRAINT "BandSchedule_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "BandSchedule" DROP CONSTRAINT "BandSchedule_eventBandId_fkey";

-- DropTable
DROP TABLE "BandSchedule";

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "liveEventId" TEXT NOT NULL,
    "eventBandId" TEXT,
    "type" TEXT NOT NULL,
    "startMin" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_liveEventId_fkey" FOREIGN KEY ("liveEventId") REFERENCES "LiveEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_eventBandId_fkey" FOREIGN KEY ("eventBandId") REFERENCES "EventBand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
