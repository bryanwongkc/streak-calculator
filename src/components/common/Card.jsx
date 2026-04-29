import React from 'react';

export const Card = ({ children, className = '', as: Component = 'div' }) => (
  <Component className={`rounded-xl border border-[#d1d5db]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,244,246,0.98))] shadow-[0_18px_46px_rgba(148,163,184,0.13)] backdrop-blur-xl ${className}`}>
    {children}
  </Component>
);
