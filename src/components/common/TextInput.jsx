import React from 'react';

export const TextInput = ({ className = '', ...props }) => (
  <input
    type="text"
    className={`w-full rounded-lg border border-[#d1d5db]/80 bg-white px-2.5 py-1 text-[#374151] outline-none focus:ring-2 focus:ring-[#9ca3af]/40 ${className}`}
    {...props}
  />
);
