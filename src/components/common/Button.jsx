import React from 'react';

const variants = {
  primary: 'bg-[linear-gradient(135deg,#111827,#4b5563)] text-white border-[#9ca3af]/55 shadow-[0_16px_32px_rgba(75,85,99,0.22)] hover:brightness-105',
  secondary: 'bg-white/90 text-[#374151] border-[#d1d5db]/80 hover:border-[#9ca3af]/60 hover:text-[#111827]',
  ghost: 'bg-transparent text-[#6b7280] border-transparent hover:text-[#111827] hover:bg-white/60',
  danger: 'bg-[#4b5563] text-white border-[#9ca3af]/45 hover:bg-[#374151]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = ({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  type = 'button',
  icon: Icon,
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {Icon ? <Icon size={size === 'sm' ? 14 : 18} /> : null}
    {children}
  </button>
);
