import React from 'react';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';
import { calculateStackValue } from './chipMath';

export const InitialStackEditor = ({
  players,
  colors,
  selectedPlayerId,
  onSelectedPlayerChange,
  initialCounts,
  onCountsChange,
  disabled,
}) => {
  const selectedCounts = initialCounts[selectedPlayerId] || {};
  const total = calculateStackValue(colors, selectedCounts);

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="font-semibold text-[#111827]">Initial stack</h2>
        <p className="text-sm text-[#6b7280]">Shared starting chip counts by player.</p>
      </div>

      <select
        value={selectedPlayerId}
        onChange={(event) => onSelectedPlayerChange(event.target.value)}
        className="mb-4 w-full rounded-lg border border-[#d1d5db]/80 bg-white px-3 py-2 text-[#374151] outline-none focus:ring-2 focus:ring-[#9ca3af]/40"
      >
        {players.map((player) => (
          <option key={player.id} value={player.id}>{player.name}</option>
        ))}
      </select>

      <div className="space-y-3">
        {colors.map((color) => (
          <label key={color.id} className="grid grid-cols-[1fr_110px] items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.colorHex }} />
              {color.name}
            </span>
            <NumberInput
              value={selectedCounts[color.id] || ''}
              disabled={disabled}
              onChange={(value) => onCountsChange(selectedPlayerId, color.id, Math.max(0, parseInt(value, 10) || 0))}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm">
        Initial value: <span className="font-mono font-bold text-[#111827]">{total.toLocaleString()}</span>
      </div>
    </Card>
  );
};
