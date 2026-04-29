import React from 'react';

export const NumberInput = ({ className = '', value, onChange, ...props }) => (
  <input
    type="number"
    inputMode="numeric"
    value={value ?? ''}
    onChange={(event) => onChange?.(event.target.value)}
    className={`w-full rounded-lg border border-[#d1d5db]/80 bg-white px-3 py-2 font-mono text-[#374151] outline-none focus:ring-2 focus:ring-[#9ca3af]/40 ${className}`}
    {...props}
  />
);
