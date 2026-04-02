"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-gray-900">
        🎸 本気管理部
      </Link>
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                  {user.nickname.charAt(0)}
                </div>
              )}
              <span className="text-sm text-gray-600">{user.nickname}</span>
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ログアウト
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/auth/signin")}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ログイン
          </button>
        )}
      </div>
    </header>
  );
}
