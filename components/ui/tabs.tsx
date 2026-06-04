type TabItem<T extends string> = {
  id: T;
  label: string;
  disabled?: boolean;
};

type GenericTabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
};

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: GenericTabsProps<T>) {
  return (
    <div
      className={`inline-flex rounded-xl bg-slate-100 p-1 ${className ?? ""}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-black text-white"
                : "text-slate-600 hover:bg-slate-200"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}