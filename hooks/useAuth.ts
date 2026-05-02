"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { User } from "@/lib/types";
import { canManageEvent as checkCanManageEvent, isAdmin as checkIsAdmin } from "@/lib/permissions";

export function useAuth() {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user: User | null) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, [status]);

  const role = currentUser?.role ?? "user";
  const permUser = currentUser ? { id: currentUser.id, role } : null;

  return {
    user: session?.user ?? null,
    currentUser,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: permUser ? checkIsAdmin(permUser) : false,
    canManageEvent: permUser ? checkCanManageEvent(permUser) : false,
    signIn: () => signIn("google"),
    signOut: () => signOut({ callbackUrl: "/" }),
  };
}
