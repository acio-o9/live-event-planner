import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      sub: string;
      nickname: string;
      avatarUrl?: string;
    };
  }
}
