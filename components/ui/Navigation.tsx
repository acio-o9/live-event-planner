"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "ダッシュボード" },
  { href: "/live-events", label: "ライブイベント" },
  { href: "/bands", label: "バンド" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/members", label: "メンバー" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-6">
      <ul className="flex gap-1">
        {links.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`inline-block px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
