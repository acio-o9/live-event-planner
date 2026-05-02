import type { UserRole } from "@/lib/types";

export type PermissionUser = { id: string; role: UserRole };

export function isAdmin(user: PermissionUser): boolean {
  return user.role === "admin";
}

export function canManageEvent(user: PermissionUser): boolean {
  return user.role === "admin" || user.role === "honki_kanrinin";
}

export function canEditBand(user: PermissionUser, bandLeaderUserId: string): boolean {
  return canManageEvent(user) || user.id === bandLeaderUserId;
}

export function canEditSetlist(user: PermissionUser, bandMemberUserIds: string[]): boolean {
  return canManageEvent(user) || bandMemberUserIds.includes(user.id);
}

export function canUpdateTaskStatus(user: PermissionUser, assigneeUserId?: string | null): boolean {
  return canManageEvent(user) || user.id === assigneeUserId;
}

export function canChangeUserRole(changer: PermissionUser, targetRole: UserRole): boolean {
  if (changer.role === "admin") return true;
  if (changer.role === "honki_kanrinin") return targetRole !== "admin";
  return false;
}

export function canRegisterExpense(user: PermissionUser, bandMemberUserIds: string[]): boolean {
  return canManageEvent(user) || bandMemberUserIds.includes(user.id);
}

export function canEditExpense(user: PermissionUser, paidByUserId: string): boolean {
  return canManageEvent(user) || user.id === paidByUserId;
}
