import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // JWT にユーザーの sub を保持する
    jwt({ token, account, profile }) {
      if (account && profile) {
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
    signIn: "/api/auth/signin",
  },
});
