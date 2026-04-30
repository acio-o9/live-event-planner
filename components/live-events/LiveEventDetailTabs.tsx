import { LiveEventDetailTab } from "@/lib/types";

interface LiveEventDetailTabsProps {
  activeTab: LiveEventDetailTab;
  onTabChange: (tab: LiveEventDetailTab) => void;
}

const TABS: { id: LiveEventDetailTab; label: string }[] = [
  { id: "bands", label: "バンド一覧" },
  { id: "milestones", label: "マイルストーン" },
  { id: "expenses", label: "費用管理" },
];

export function LiveEventDetailTabs({ activeTab, onTabChange }: LiveEventDetailTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
