"use client";

import type { Instrument } from "@/lib/types";

interface Props {
  instruments: Instrument[];
  selected: string | null;
  onChange: (instrumentId: string | null) => void;
}

export function InstrumentFilter({ instruments, selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
          selected === null
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
        }`}
      >
        すべて
      </button>
      {instruments.map((inst) => (
        <button
          key={inst.id}
          onClick={() => onChange(inst.id)}
          className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
            selected === inst.id
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
          }`}
        >
          {inst.name}
        </button>
      ))}
    </div>
  );
}
