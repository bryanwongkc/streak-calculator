import React from 'react';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';
import { calculateStackValue } from './chipMath';
import { formatSignedNumber } from '../../utils/formatting';

export const CurrentStackEditor = ({
  colors,
  selectedPlayer,
  initialCounts,
  currentCounts,
  onCurrentCountsChange,
}) => {
  const initialValue = calculateStackValue(colors, initialCounts);
  const currentValue = calculateStackValue(colors, currentCounts);
  const difference = currentValue - initialValue;

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="font-semibold text-[#111827]">My current stack</h2>
        <p className="text-sm text-[#6b7280]">Stored only on this browser for {selectedPlayer?.name || 'the selected player'}.</p>
      </div>

      <div className="space-y-3">
        {colors.map((color) => (
          <label key={color.id} className="grid grid-cols-[1fr_110px] items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.colorHex }} />
              {color.name}
            </span>
            <NumberInput
              value={currentCounts[color.id] || ''}
              onChange={(value) => onCurrentCountsChange(color.id, Math.max(0, parseInt(value, 10) || 0))}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3 text-center text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Current</p>
          <p className="font-mono font-bold text-[#111827]">{currentValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Initial</p>
          <p className="font-mono font-bold text-[#374151]">{initialValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Diff</p>
          <p className={`font-mono font-bold ${difference >= 0 ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
            {formatSignedNumber(difference)}
          </p>
        </div>
      </div>
    </Card>
  );
};
