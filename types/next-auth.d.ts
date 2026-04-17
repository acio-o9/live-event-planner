import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      sub: string;
      email?: string | null;
      nickname: string;
      avatarUrl?: string;
    };
  }
}
