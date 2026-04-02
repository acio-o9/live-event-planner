import { render, screen, fireEvent } from "@testing-library/react";
import { InstrumentFilter } from "../InstrumentFilter";
import type { Instrument } from "@/lib/types";

const instruments: Instrument[] = [
  { id: "1", name: "ギター", order: 1 },
  { id: "2", name: "ベース", order: 2 },
  { id: "3", name: "ドラム", order: 3 },
];

describe("InstrumentFilter", () => {
  it("「すべて」ボタンと各楽器ボタンが表示される", () => {
    render(
      <InstrumentFilter instruments={instruments} selected={null} onChange={() => {}} />
    );
    expect(screen.getByText("すべて")).toBeInTheDocument();
    expect(screen.getByText("ギター")).toBeInTheDocument();
    expect(screen.getByText("ベース")).toBeInTheDocument();
    expect(screen.getByText("ドラム")).toBeInTheDocument();
  });

  it("selected=null のとき「すべて」がアクティブスタイル", () => {
    render(
      <InstrumentFilter instruments={instruments} selected={null} onChange={() => {}} />
    );
    const allBtn = screen.getByText("すべて");
    expect(allBtn).toHaveClass("bg-blue-600");
  });

  it("楽器ボタンをクリックすると onChange が呼ばれる", () => {
    const onChange = jest.fn();
    render(
      <InstrumentFilter instruments={instruments} selected={null} onChange={onChange} />
    );
    fireEvent.click(screen.getByText("ギター"));
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("「すべて」クリックで onChange(null) が呼ばれる", () => {
    const onChange = jest.fn();
    render(
      <InstrumentFilter instruments={instruments} selected="1" onChange={onChange} />
    );
    fireEvent.click(screen.getByText("すべて"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("selected に一致する楽器ボタンがアクティブスタイル", () => {
    render(
      <InstrumentFilter instruments={instruments} selected="2" onChange={() => {}} />
    );
    expect(screen.getByText("ベース")).toHaveClass("bg-blue-600");
    expect(screen.getByText("ギター")).not.toHaveClass("bg-blue-600");
  });
});
