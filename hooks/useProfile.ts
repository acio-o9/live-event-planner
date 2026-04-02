"use client";

import { useState, useEffect, useCallback } from "react";
import type { User, Instrument, ProfileUpdateFormData } from "@/lib/types";

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userRes, instrumentsRes] = await Promise.all([
        fetch("/api/users/me"),
        fetch("/api/instruments"),
      ]);
      if (!userRes.ok) throw new Error("プロフィールの取得に失敗しました");
      if (!instrumentsRes.ok) throw new Error("楽器一覧の取得に失敗しました");

      const [user, instrumentList] = await Promise.all([
        userRes.json() as Promise<User>,
        instrumentsRes.json() as Promise<Instrument[]>,
      ]);

      setProfile(user);
      setInstruments(instrumentList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (data: ProfileUpdateFormData): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await fetch("/api/users/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json() as { error?: string };
          throw new Error(body.error ?? "保存に失敗しました");
        }
        const updated = await res.json() as User;
        setProfile(updated);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { profile, instruments, isLoading, isSaving, error, updateProfile };
}
