"use client";

import { useState, useEffect, useCallback } from "react";
import { bandsApi } from "@/lib/api/bands";
import { Band, CreateBandRequest, UpdateBandRequest, AddBandMemberRequest } from "@/lib/types";

export function useBands() {
  const [bands, setBands] = useState<Band[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setBands(await bandsApi.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bands");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: CreateBandRequest) => {
    const band = await bandsApi.create(data);
    setBands((prev) => [...prev, band]);
    return band;
  }, []);

  const update = useCallback(async (id: string, data: UpdateBandRequest) => {
    const band = await bandsApi.update(id, data);
    setBands((prev) => prev.map((b) => (b.id === id ? band : b)));
    return band;
  }, []);

  const addMember = useCallback(async (id: string, data: AddBandMemberRequest) => {
    const band = await bandsApi.addMember(id, data);
    setBands((prev) => prev.map((b) => (b.id === id ? band : b)));
    return band;
  }, []);

  const removeMember = useCallback(async (id: string, userSub: string) => {
    const band = await bandsApi.removeMember(id, userSub);
    setBands((prev) => prev.map((b) => (b.id === id ? band : b)));
    return band;
  }, []);

  return { bands, isLoading, error, create, update, addMember, removeMember, reload: load };
}
