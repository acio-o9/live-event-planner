-- Migration: User.id を新しいPKとして追加し、subリレーションをidリレーションに移行

-- Step 1: User に id カラムを追加（既存行にはgen_random_uuid()でUUIDを生成）
ALTER TABLE "User" ADD COLUMN "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT;

-- Step 2: FK制約を一時的に削除（subを参照しているもの）
ALTER TABLE "LiveEvent" DROP CONSTRAINT "LiveEvent_createdBy_fkey";
ALTER TABLE "EventBand" DROP CONSTRAINT "EventBand_createdBy_fkey";
ALTER TABLE "EventBandMember" DROP CONSTRAINT "EventBandMember_userSub_fkey";
ALTER TABLE "BandSchedule" DROP CONSTRAINT "BandSchedule_createdBy_fkey";
ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeUserSub_fkey";
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_paidBy_fkey";
ALTER TABLE "UserInstrument" DROP CONSTRAINT "UserInstrument_userSub_fkey";

-- Step 3: 同名カラム（createdBy, paidBy）の値をsubからidに更新
UPDATE "LiveEvent" le SET "createdBy" = u."id" FROM "User" u WHERE u.sub = le."createdBy";
UPDATE "EventBand" eb SET "createdBy" = u."id" FROM "User" u WHERE u.sub = eb."createdBy";
UPDATE "BandSchedule" bs SET "createdBy" = u."id" FROM "User" u WHERE u.sub = bs."createdBy";
UPDATE "Expense" e SET "paidBy" = u."id" FROM "User" u WHERE u.sub = e."paidBy";

-- Step 4: userSub / assigneeUserSub カラムを持つテーブルに userId カラムを追加（NULLABLEで追加して後でNOT NULLに）
ALTER TABLE "UserInstrument" ADD COLUMN "userId" TEXT;
ALTER TABLE "EventBandMember" ADD COLUMN "userId" TEXT;
ALTER TABLE "Task" ADD COLUMN "assigneeUserId" TEXT;
ALTER TABLE "MemberSnapshot" ADD COLUMN "userId" TEXT;

-- Step 5: 新カラムに値を移行
UPDATE "UserInstrument" ui SET "userId" = u."id" FROM "User" u WHERE u.sub = ui."userSub";
UPDATE "EventBandMember" ebm SET "userId" = u."id" FROM "User" u WHERE u.sub = ebm."userSub";
UPDATE "Task" t SET "assigneeUserId" = u."id" FROM "User" u WHERE u.sub = t."assigneeUserSub";
UPDATE "MemberSnapshot" ms SET "userId" = u."id" FROM "User" u WHERE u.sub = ms."userSub";

-- Step 6: UserのPKをsubからidに変更、subをUNIQUEに
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "User" ADD CONSTRAINT "User_sub_key" UNIQUE ("sub");

-- Step 7: UserInstrument の複合PK変更（userSub → userId）
ALTER TABLE "UserInstrument" DROP CONSTRAINT "UserInstrument_pkey";
ALTER TABLE "UserInstrument" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "UserInstrument" ADD CONSTRAINT "UserInstrument_pkey" PRIMARY KEY ("userId", "instrumentId");
ALTER TABLE "UserInstrument" DROP COLUMN "userSub";

-- Step 8: EventBandMember の複合PK変更（userSub → userId）
ALTER TABLE "EventBandMember" DROP CONSTRAINT "EventBandMember_pkey";
ALTER TABLE "EventBandMember" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "EventBandMember" ADD CONSTRAINT "EventBandMember_pkey" PRIMARY KEY ("eventBandId", "userId");
ALTER TABLE "EventBandMember" DROP COLUMN "userSub";

-- Step 9: Task の assigneeUserSub を削除（assigneeUserId は NULLABLE のまま）
ALTER TABLE "Task" DROP COLUMN "assigneeUserSub";

-- Step 10: MemberSnapshot の userSub を削除（userId は NOT NULL に）
ALTER TABLE "MemberSnapshot" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "MemberSnapshot" DROP COLUMN "userSub";

-- Step 11: FK制約を再追加（User.id を参照）
ALTER TABLE "LiveEvent" ADD CONSTRAINT "LiveEvent_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "EventBand" ADD CONSTRAINT "EventBand_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "UserInstrument" ADD CONSTRAINT "UserInstrument_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "EventBandMember" ADD CONSTRAINT "EventBandMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "BandSchedule" ADD CONSTRAINT "BandSchedule_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeUserId_fkey"
  FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paidBy_fkey"
  FOREIGN KEY ("paidBy") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
