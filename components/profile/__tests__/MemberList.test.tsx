import { render, screen } from "@testing-library/react";
import { MemberList } from "../MemberList";
import type { User } from "@/lib/types";

const members: User[] = [
  {
    sub: "user-1",
    nickname: "たろう",
    instruments: [
      { id: "1", name: "ギター", order: 1 },
      { id: "3", name: "ドラム", order: 3 },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    sub: "user-2",
    nickname: "はなこ",
    instruments: [],
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("MemberList", () => {
  it("メンバー名が表示される", () => {
    render(<MemberList members={members} />);
    expect(screen.getByText("たろう")).toBeInTheDocument();
    expect(screen.getByText("はなこ")).toBeInTheDocument();
  });

  it("担当楽器バッジが表示される", () => {
    render(<MemberList members={members} />);
    expect(screen.getByText("ギター")).toBeInTheDocument();
    expect(screen.getByText("ドラム")).toBeInTheDocument();
  });

  it("楽器未設定のメンバーでもエラーなく表示される", () => {
    render(<MemberList members={members} />);
    expect(screen.getByText("はなこ")).toBeInTheDocument();
  });

  it("空配列のとき「該当するメンバーがいません」と表示される", () => {
    render(<MemberList members={[]} />);
    expect(screen.getByText("該当するメンバーがいません")).toBeInTheDocument();
  });
});
