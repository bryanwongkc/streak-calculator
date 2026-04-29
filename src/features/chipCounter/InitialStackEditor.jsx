import React from 'react';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';
import { calculateStackValue } from './chipMath';

export const InitialStackEditor = ({
  colors,
  initialCounts,
  onCountsChange,
  disabled,
}) => {
  const total = calculateStackValue(colors, initialCounts);

  return (
    <Card className="p-3 md:p-4">
      <div className="mb-3">
        <h2 className="font-semibold text-[#111827]">Starting Stack</h2>
        <p className="text-sm text-[#6b7280]">Everyone starts with this same chip stack.</p>
      </div>

      <div className="space-y-2">
        {colors.map((color) => (
          <label key={color.id} className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.colorHex }} />
              <span className="truncate">{color.name}</span>
            </span>
            <NumberInput
              value={initialCounts[color.id] || ''}
              disabled={disabled}
              onChange={(value) => onCountsChange(color.id, Math.max(0, parseInt(value, 10) || 0))}
            />
          </label>
        ))}
      </div>

      <div className="sticky bottom-[74px] mt-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm shadow-[0_10px_28px_rgba(148,163,184,0.16)] md:static md:shadow-none">
        Initial Stack Value: <span className="font-mono font-bold text-[#111827]">{total.toLocaleString()}</span>
      </div>
    </Card>
  );
};
