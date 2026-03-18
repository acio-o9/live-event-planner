import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const isDev = process.env.NODE_ENV === "development";
const hasGoogleCreds =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Google OIDC（クレデンシャルが設定されている場合のみ有効）
    ...(hasGoogleCreds
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    // 開発用モックログイン（本番環境では無効）
    ...(isDev
      ? [
          Credentials({
            id: "dev-login",
            name: "開発用ログイン",
            credentials: {
              nickname: { label: "ニックネーム", type: "text", placeholder: "maru" },
            },
            async authorize(credentials) {
              const nickname = (credentials?.nickname as string) || "開発ユーザー";
              return {
                id: `dev-${nickname}`,
                sub: `dev-${nickname}`,
                name: nickname,
                email: `${nickname}@dev.local`,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    // JWT にユーザーの sub を保持する
    jwt({ token, account, profile, user }) {
      if (account?.provider === "dev-login" && user) {
        // 開発用モックログイン
        token.sub = user.id;
        token.nickname = user.name ?? user.id;
      } else if (account && profile) {
        // Google OIDC
        token.sub = profile.sub ?? undefined;
        token.nickname = (profile.name ?? profile.email ?? token.sub) as string;
        token.avatarUrl = profile.picture == null ? undefined : profile.picture;
      }
      return token;
    },
    // Session にも sub を渡す
    session({ session, token }) {
      session.user.sub = token.sub as string;
      session.user.nickname = token.nickname as string;
      session.user.avatarUrl = token.avatarUrl as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});
