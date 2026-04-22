import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BandMembersModal } from "../BandMembersModal";
import { liveEventsApi } from "@/lib/api/live-events";
import type { EventBand } from "@/lib/types";

jest.mock("@/lib/api/live-events");

const mockBand: EventBand = {
  id: "band-1",
  name: "テストバンド",
  description: null,
  members: [
    { userSub: "user-1", role: "leader", user: { sub: "user-1", nickname: "たろう", instruments: [], createdAt: "" } },
    { userSub: "user-2", role: "member", user: { sub: "user-2", nickname: "はなこ", instruments: [], createdAt: "" } },
  ],
};

const defaultProps = {
  liveEventId: "event-1",
  band: mockBand,
  onUpdate: jest.fn(),
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (liveEventsApi.listUsers as jest.Mock).mockResolvedValue([]);
});

describe("BandMembersModal - バンドマスター表示", () => {
  it("leader メンバーに「バンドマスター」ラベルが表示される", async () => {
    render(<BandMembersModal {...defaultProps} />);
    expect(screen.getByText("バンドマスター")).toBeInTheDocument();
  });

  it("「リーダー」ラベルは表示されない", async () => {
    render(<BandMembersModal {...defaultProps} />);
    expect(screen.queryByText("リーダー")).not.toBeInTheDocument();
  });

  it("非バンドマスターメンバーに「バンドマスターに変更」ボタンが表示される", async () => {
    render(<BandMembersModal {...defaultProps} />);
    expect(screen.getByText("バンドマスターに変更")).toBeInTheDocument();
  });

  it("バンドマスター行に「バンドマスターに変更」ボタンは表示されない", async () => {
    render(<BandMembersModal {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const leaderRow = screen.getByText("たろう").closest("li");
    expect(leaderRow?.querySelector("button")).toBeNull();
  });
});

describe("BandMembersModal - バンドマスター変更", () => {
  it("「バンドマスターに変更」ボタンクリックで changeLeader が呼ばれる", async () => {
    const updatedBand = { ...mockBand };
    (liveEventsApi.changeLeader as jest.Mock).mockResolvedValue(updatedBand);

    render(<BandMembersModal {...defaultProps} />);
    fireEvent.click(screen.getByText("バンドマスターに変更"));

    await waitFor(() => {
      expect(liveEventsApi.changeLeader).toHaveBeenCalledWith("event-1", "band-1", { userSub: "user-2" });
    });
  });

  it("変更成功後に onUpdate が呼ばれる", async () => {
    const updatedBand = { ...mockBand };
    (liveEventsApi.changeLeader as jest.Mock).mockResolvedValue(updatedBand);

    render(<BandMembersModal {...defaultProps} />);
    fireEvent.click(screen.getByText("バンドマスターに変更"));

    await waitFor(() => {
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(updatedBand);
    });
  });

  it("変更失敗時にエラーメッセージが表示される", async () => {
    (liveEventsApi.changeLeader as jest.Mock).mockRejectedValue(new Error("変更エラー"));

    render(<BandMembersModal {...defaultProps} />);
    fireEvent.click(screen.getByText("バンドマスターに変更"));

    await waitFor(() => {
      expect(screen.getByText("変更エラー")).toBeInTheDocument();
    });
  });
});
