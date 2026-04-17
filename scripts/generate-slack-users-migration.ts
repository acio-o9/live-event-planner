/**
 * Slack APIからメンバー一覧を取得し、Userテーブルへのデータマイグレーションファイルを生成する。
 * 使い方: SLACK_BOT_TOKEN=xoxb-... npx ts-node --project tsconfig.seed.json scripts/generate-slack-users-migration.ts
 */

import * as fs from "fs";
import * as path from "path";

interface SlackProfile {
  display_name?: string;
  real_name?: string;
  email?: string;
  image_72?: string;
}

interface SlackMember {
  id: string;
  deleted: boolean;
  is_bot: boolean;
  is_app_user: boolean;
  profile: SlackProfile;
}

interface SlackUsersListResponse {
  ok: boolean;
  members: SlackMember[];
  error?: string;
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("SLACK_BOT_TOKEN is required");
    process.exit(1);
  }

  const res = await fetch("https://slack.com/api/users.list", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error(`HTTP error: ${res.status}`);
    process.exit(1);
  }

  const data: SlackUsersListResponse = await res.json();
  if (!data.ok) {
    console.error(`Slack API error: ${data.error}`);
    process.exit(1);
  }

  const members = data.members.filter(
    (m) => !m.deleted && !m.is_bot && !m.is_app_user && m.profile?.email
  );

  if (members.length === 0) {
    console.log("No eligible Slack members found.");
    return;
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
  const dirName = `${timestamp}_seed_slack_users`;
  const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");
  const migrationDir = path.join(migrationsDir, dirName);

  fs.mkdirSync(migrationDir, { recursive: true });

  const insertStatements = members.map((m) => {
    const slackSub = escapeSql(m.id);
    const sub = escapeSql(`slack:${m.id}`);
    const rawName = m.profile.display_name || m.profile.real_name || m.id;
    const chars = Array.from(rawName);
    const masked = chars[0] + "*".repeat(Math.max(chars.length - 1, 1));
    const nickname = escapeSql(masked);
    const avatarUrl = m.profile.image_72
      ? `'${escapeSql(m.profile.image_72)}'`
      : "NULL";

    return (
      `INSERT INTO "User" ("sub", "slackSub", "nickname", "avatarUrl", "createdAt")\n` +
      `VALUES ('${sub}', '${slackSub}', '${nickname}', ${avatarUrl}, NOW())\n` +
      `ON CONFLICT ("slackSub") DO UPDATE SET "nickname" = EXCLUDED."nickname", "avatarUrl" = EXCLUDED."avatarUrl";`
    );
  });

  const sql = [
    `-- Data migration: seed Slack members as pre-registered users`,
    `-- Generated at ${new Date().toISOString()} (${members.length} members)`,
    "",
    ...insertStatements,
  ].join("\n");

  const outputPath = path.join(migrationDir, "migration.sql");
  fs.writeFileSync(outputPath, sql, "utf-8");

  console.log(`✅ Migration file created: prisma/migrations/${dirName}/migration.sql`);
  console.log(`   ${members.length} users included`);
  console.log(`\nApply with:`);
  console.log(`  npx prisma migrate deploy`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
