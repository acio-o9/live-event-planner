"use client";

import type { Instrument } from "@/lib/types";

interface Props {
  instruments: Instrument[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function InstrumentSelector({ instruments, selectedIds, onChange }: Props) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {instruments.map((inst) => {
        const checked = selectedIds.includes(inst.id);
        return (
          <label
            key={inst.id}
            className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-colors ${
              checked
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => toggle(inst.id)}
            />
            {inst.name}
          </label>
        );
      })}
    </div>
  );
}
