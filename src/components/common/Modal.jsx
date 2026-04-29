import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({ open, title, children, onClose, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111827]/35 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-[#d1d5db]/90 bg-[#f8fafc] shadow-[0_28px_80px_rgba(17,24,39,0.24)]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          <Button aria-label="Close" size="icon" variant="ghost" onClick={onClose} icon={X} />
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer ? <div className="border-t border-[#e5e7eb] px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
};
