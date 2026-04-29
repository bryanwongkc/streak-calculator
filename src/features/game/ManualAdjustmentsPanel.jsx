import React from 'react';
import { CheckCircle2, MessageSquare, Settings2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';

const ADJUSTMENT_REASONS = ['花', '暗槓', '圍骰', '123', '其他'];

export const ManualAdjustmentsPanel = ({
  players,
  values,
  remarks,
  onValueChange,
  onRemarksChange,
  onCancel,
  onApply,
  disabled,
  embedded = false,
}) => {
  const sum = Object.values(values).reduce((total, value) => total + Number(value || 0), 0);
  const Wrapper = embedded ? 'div' : Card;

  return (
    <Wrapper className={embedded ? '' : 'p-3 md:p-6'}>
      <div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between">
        <h2 className={`${embedded ? 'hidden' : 'flex'} items-center gap-2 text-lg font-semibold text-[#374151] md:text-xl`}>
          <Settings2 size={20} /> Manual adjustments
        </h2>
        <div className={`self-start rounded-full border px-3 py-1 text-[11px] font-bold md:self-auto ${sum === 0 ? 'border-[#86efac]/70 bg-[#dcfce7] text-[#166534]' : 'border-[#fecaca]/80 bg-[#fee2e2] text-[#991b1b]'}`}>
          Balance: {sum > 0 ? `+${sum}` : sum} {sum === 0 ? '(zero-sum)' : '(not zero-sum)'}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 md:mb-4 md:grid-cols-4 md:gap-4">
        {players.map((player) => (
          <div key={player.id} className="space-y-1">
            <label className="text-xs font-bold uppercase text-[#6b7280]">{player.name}</label>
            <NumberInput
              value={values[player.id] || ''}
              onChange={(value) => onValueChange(player.id, parseInt(value, 10) || 0)}
              placeholder="+/-"
              className="py-1.5"
            />
          </div>
        ))}
      </div>

      <div className="mb-3 space-y-1.5 md:mb-4 md:space-y-2">
        <label className="flex items-center gap-1 text-xs font-bold uppercase text-[#6b7280]">
          <MessageSquare size={12} /> 原因
        </label>
        <select
          value={remarks}
          onChange={(event) => onRemarksChange(event.target.value)}
          className="w-full rounded-lg border border-[#d1d5db]/80 bg-white px-3 py-2 text-[#374151] outline-none focus:ring-2 focus:ring-[#9ca3af]/40"
        >
          <option value="">選擇原因</option>
          {ADJUSTMENT_REASONS.map((reason) => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>取消</Button>
        <Button variant="primary" onClick={onApply} disabled={disabled} icon={CheckCircle2}>確定</Button>
      </div>
    </Wrapper>
  );
};
