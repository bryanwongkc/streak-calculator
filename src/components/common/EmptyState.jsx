import React from 'react';

export const EmptyState = ({ title, description, action }) => (
  <div className="rounded-xl border border-dashed border-[#d1d5db]/90 bg-white/70 px-4 py-8 text-center text-[#6b7280]">
    <p className="font-semibold text-[#374151]">{title}</p>
    {description ? <p className="mt-1 text-sm">{description}</p> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);
