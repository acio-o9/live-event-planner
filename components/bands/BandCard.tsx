import Link from "next/link";
import { Band } from "@/lib/types";

export function BandCard({ band }: { band: Band }) {
  return (
    <Link
      href={`/bands/${band.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-gray-900">{band.name}</h3>
      {band.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{band.description}</p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        メンバー {band.members.length}人
      </p>
    </Link>
  );
}
