import { Band } from "@/lib/types";
import { BandCard } from "./BandCard";

export function BandList({ bands }: { bands: Band[] }) {
  if (bands.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">バンドがまだありません</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bands.map((band) => (
        <BandCard key={band.id} band={band} />
      ))}
    </div>
  );
}
