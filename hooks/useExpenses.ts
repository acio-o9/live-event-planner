"use client";

import { useState, useEffect, useCallback } from "react";
import { expensesApi } from "@/lib/api/expenses";
import { Expense, ExpenseSummary, CreateExpenseRequest, UpdateExpenseRequest } from "@/lib/types";

export function useExpenses(eventId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setExpenses(await expensesApi.list(eventId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "費用の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: CreateExpenseRequest) => {
    const expense = await expensesApi.create(eventId, data);
    setExpenses((prev) => [...prev, expense]);
    return expense;
  }, [eventId]);

  const update = useCallback(async (expenseId: string, data: UpdateExpenseRequest) => {
    const expense = await expensesApi.update(eventId, expenseId, data);
    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? expense : e)));
    return expense;
  }, [eventId]);

  const remove = useCallback(async (expenseId: string) => {
    await expensesApi.delete(eventId, expenseId);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }, [eventId]);

  return { expenses, isLoading, error, create, update, remove, reload: load };
}

export function useExpenseSummary(eventId: string) {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSummary(await expensesApi.summary(eventId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "サマリーの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  return { summary, isLoading, error, reload: load };
}
