-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- DataMigration: 既存ユーザー全員を admin にセット
UPDATE "User" SET role = 'admin';
