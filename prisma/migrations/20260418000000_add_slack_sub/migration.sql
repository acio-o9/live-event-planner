-- AlterTable
ALTER TABLE "User" ADD COLUMN "slackSub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_slackSub_key" ON "User"("slackSub");

-- AlterTable: add onUpdate CASCADE to all foreign keys referencing User.sub
ALTER TABLE "UserInstrument" DROP CONSTRAINT "UserInstrument_userSub_fkey";
ALTER TABLE "UserInstrument" ADD CONSTRAINT "UserInstrument_userSub_fkey"
  FOREIGN KEY ("userSub") REFERENCES "User"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LiveEvent" DROP CONSTRAINT "LiveEvent_createdBy_fkey";
ALTER TABLE "LiveEvent" ADD CONSTRAINT "LiveEvent_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EventBand" DROP CONSTRAINT "EventBand_createdBy_fkey";
ALTER TABLE "EventBand" ADD CONSTRAINT "EventBand_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EventBandMember" DROP CONSTRAINT "EventBandMember_userSub_fkey";
ALTER TABLE "EventBandMember" ADD CONSTRAINT "EventBandMember_userSub_fkey"
  FOREIGN KEY ("userSub") REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BandSchedule" DROP CONSTRAINT "BandSchedule_createdBy_fkey";
ALTER TABLE "BandSchedule" ADD CONSTRAINT "BandSchedule_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeUserSub_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeUserSub_fkey"
  FOREIGN KEY ("assigneeUserSub") REFERENCES "User"("sub") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Expense" DROP CONSTRAINT "Expense_paidBy_fkey";
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paidBy_fkey"
  FOREIGN KEY ("paidBy") REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE;
