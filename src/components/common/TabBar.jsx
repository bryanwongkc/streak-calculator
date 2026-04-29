import React from 'react';

export const TabBar = ({ tabs, activeTab, onTabChange }) => (
  <nav className="sticky bottom-3 z-30 mx-auto grid max-w-xl grid-cols-4 gap-1 rounded-xl border border-[#d1d5db]/90 bg-white/90 p-1 shadow-[0_18px_48px_rgba(148,163,184,0.22)] backdrop-blur-xl md:top-3 md:bottom-auto">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const active = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-all md:text-sm ${active ? 'bg-[#111827] text-white shadow-[0_10px_22px_rgba(17,24,39,0.18)]' : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]'}`}
          aria-current={active ? 'page' : undefined}
        >
          <Icon size={16} />
          <span>{tab.label}</span>
        </button>
      );
    })}
  </nav>
);
