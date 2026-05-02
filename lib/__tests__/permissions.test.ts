import {
  isAdmin,
  canManageEvent,
  canEditBand,
  canEditSetlist,
  canUpdateTaskStatus,
  canChangeUserRole,
  canRegisterExpense,
  canEditExpense,
} from "@/lib/permissions";
import type { PermissionUser } from "@/lib/permissions";

const admin: PermissionUser = { id: "u-admin", role: "admin" };
const kanrinin: PermissionUser = { id: "u-kanrinin", role: "honki_kanrinin" };
const user: PermissionUser = { id: "u-user", role: "user" };

describe("isAdmin", () => {
  it("admin は true", () => expect(isAdmin(admin)).toBe(true));
  it("honki_kanrinin は false", () => expect(isAdmin(kanrinin)).toBe(false));
  it("user は false", () => expect(isAdmin(user)).toBe(false));
});

describe("canManageEvent", () => {
  it("admin は true", () => expect(canManageEvent(admin)).toBe(true));
  it("honki_kanrinin は true", () => expect(canManageEvent(kanrinin)).toBe(true));
  it("user は false", () => expect(canManageEvent(user)).toBe(false));
});

describe("canEditBand", () => {
  const leaderId = "u-leader";
  const leader: PermissionUser = { id: leaderId, role: "user" };
  const other: PermissionUser = { id: "u-other", role: "user" };

  it("admin は true", () => expect(canEditBand(admin, leaderId)).toBe(true));
  it("honki_kanrinin は true", () => expect(canEditBand(kanrinin, leaderId)).toBe(true));
  it("バンドリーダー本人は true", () => expect(canEditBand(leader, leaderId)).toBe(true));
  it("バンドリーダー以外の user は false", () => expect(canEditBand(other, leaderId)).toBe(false));
});

describe("canEditSetlist", () => {
  const memberIds = ["u-m1", "u-m2"];
  const member: PermissionUser = { id: "u-m1", role: "user" };
  const nonMember: PermissionUser = { id: "u-other", role: "user" };

  it("admin は true", () => expect(canEditSetlist(admin, memberIds)).toBe(true));
  it("honki_kanrinin は true", () => expect(canEditSetlist(kanrinin, memberIds)).toBe(true));
  it("バンドメンバーは true", () => expect(canEditSetlist(member, memberIds)).toBe(true));
  it("バンド外の user は false", () => expect(canEditSetlist(nonMember, memberIds)).toBe(false));
});

describe("canUpdateTaskStatus", () => {
  const assignee: PermissionUser = { id: "u-assignee", role: "user" };
  const other: PermissionUser = { id: "u-other", role: "user" };

  it("admin は true", () => expect(canUpdateTaskStatus(admin, "u-assignee")).toBe(true));
  it("honki_kanrinin は true", () => expect(canUpdateTaskStatus(kanrinin, "u-assignee")).toBe(true));
  it("担当者本人は true", () => expect(canUpdateTaskStatus(assignee, "u-assignee")).toBe(true));
  it("担当者以外の user は false", () => expect(canUpdateTaskStatus(other, "u-assignee")).toBe(false));
  it("assigneeUserId が null でも担当者以外は false", () => expect(canUpdateTaskStatus(other, null)).toBe(false));
  it("admin は assigneeUserId が null でも true", () => expect(canUpdateTaskStatus(admin, null)).toBe(true));
});

describe("canChangeUserRole", () => {
  it("admin は admin への変更が可能", () => expect(canChangeUserRole(admin, "admin")).toBe(true));
  it("admin は honki_kanrinin への変更が可能", () => expect(canChangeUserRole(admin, "honki_kanrinin")).toBe(true));
  it("admin は user への変更が可能", () => expect(canChangeUserRole(admin, "user")).toBe(true));
  it("honki_kanrinin は honki_kanrinin への変更が可能", () => expect(canChangeUserRole(kanrinin, "honki_kanrinin")).toBe(true));
  it("honki_kanrinin は user への変更が可能", () => expect(canChangeUserRole(kanrinin, "user")).toBe(true));
  it("honki_kanrinin は admin への変更は不可", () => expect(canChangeUserRole(kanrinin, "admin")).toBe(false));
  it("user は全ての変更が不可", () => {
    expect(canChangeUserRole(user, "admin")).toBe(false);
    expect(canChangeUserRole(user, "honki_kanrinin")).toBe(false);
    expect(canChangeUserRole(user, "user")).toBe(false);
  });
});

describe("canRegisterExpense", () => {
  const memberIds = ["u-m1", "u-m2"];
  const member: PermissionUser = { id: "u-m1", role: "user" };
  const nonMember: PermissionUser = { id: "u-other", role: "user" };

  it("admin は true", () => expect(canRegisterExpense(admin, memberIds)).toBe(true));
  it("honki_kanrinin は true", () => expect(canRegisterExpense(kanrinin, memberIds)).toBe(true));
  it("バンドメンバーは true", () => expect(canRegisterExpense(member, memberIds)).toBe(true));
  it("バンド外の user は false", () => expect(canRegisterExpense(nonMember, memberIds)).toBe(false));
});

describe("canEditExpense", () => {
  const payer: PermissionUser = { id: "u-payer", role: "user" };
  const other: PermissionUser = { id: "u-other", role: "user" };

  it("admin は true", () => expect(canEditExpense(admin, "u-payer")).toBe(true));
  it("honki_kanrinin は true", () => expect(canEditExpense(kanrinin, "u-payer")).toBe(true));
  it("支払い者本人は true", () => expect(canEditExpense(payer, "u-payer")).toBe(true));
  it("支払い者以外の user は false", () => expect(canEditExpense(other, "u-payer")).toBe(false));
});
