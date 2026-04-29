import React from 'react';

export const TabBar = ({ tabs, activeTab, onTabChange }) => (
  <nav
    className="fixed inset-x-2 bottom-2 z-30 mx-auto grid max-w-xl gap-1 rounded-xl border border-[#d1d5db]/90 bg-white/92 p-1 shadow-[0_18px_48px_rgba(148,163,184,0.26)] backdrop-blur-xl"
    style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
  >
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const active = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex min-h-11 items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition-all md:gap-1.5 md:px-2 md:text-sm ${active ? 'bg-[#111827] text-white shadow-[0_10px_22px_rgba(17,24,39,0.18)]' : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]'}`}
          aria-current={active ? 'page' : undefined}
        >
          <Icon size={16} />
          <span className="truncate">{tab.label}</span>
        </button>
      );
    })}
  </nav>
);
