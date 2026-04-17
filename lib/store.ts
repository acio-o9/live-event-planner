/**
 * @deprecated Prismaに移行済み。テストファイルのみが参照している。
 */
import { LiveEvent, User } from "./types";

function createStore<T>() {
  const items = new Map<string, T>();
  return {
    getAll: () => Array.from(items.values()),
    get: (id: string) => items.get(id) ?? null,
    set: (id: string, item: T) => { items.set(id, item); return item; },
    delete: (id: string) => items.delete(id),
    has: (id: string) => items.has(id),
  };
}

export const users = createStore<User>();
export const liveEvents = createStore<LiveEvent>();

export function generateId(): string {
  return crypto.randomUUID();
}
