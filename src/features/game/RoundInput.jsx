import React from 'react';
import { Swords, Trophy } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';
import { ManualAdjustmentsPanel } from './ManualAdjustmentsPanel';

export const RoundInput = ({
  players,
  currentWinner,
  roundScores,
  onWinnerChange,
  onScoreChange,
  onConfirm,
  actionTab,
  onActionTabChange,
  adjustmentValues,
  adjustmentRemarks,
  onAdjustmentValueChange,
  onAdjustmentRemarksChange,
  onAdjustmentCancel,
  onAdjustmentApply,
  disabled,
}) => {
  const losingPlayers = currentWinner
    ? players.filter((player) => player.id !== currentWinner)
    : [];

  return (
    <Card className="p-1.5 md:p-6">
      <div className="mb-2 flex items-center justify-between gap-2 md:mb-6">
        <div className="flex items-center gap-2">
          <Swords className="text-[#6b7280]" size={18} />
          <h2 className="text-[15px] font-bold text-[#1f2937] md:text-xl">食糊</h2>
        </div>
        <div className="grid grid-cols-2 rounded-lg border border-[#d1d5db]/80 bg-white/80 p-0.5 text-xs font-bold text-[#6b7280]">
          <button
            type="button"
            className={`rounded-md px-2.5 py-1.5 transition ${actionTab === 'round' ? 'bg-[#111827] text-white shadow-sm' : 'hover:text-[#111827]'}`}
            onClick={() => onActionTabChange('round')}
          >
            胡
          </button>
          <button
            type="button"
            className={`rounded-md px-2.5 py-1.5 transition ${actionTab === 'adjustments' ? 'bg-[#111827] text-white shadow-sm' : 'hover:text-[#111827]'}`}
            onClick={() => onActionTabChange('adjustments')}
          >
            其他
          </button>
        </div>
      </div>

      {actionTab === 'adjustments' ? (
        <ManualAdjustmentsPanel
          embedded
          players={players}
          values={adjustmentValues}
          remarks={adjustmentRemarks}
          onValueChange={onAdjustmentValueChange}
          onRemarksChange={onAdjustmentRemarksChange}
          onCancel={onAdjustmentCancel}
          onApply={onAdjustmentApply}
          disabled={disabled}
        />
      ) : (
        <>
          <div className={`grid grid-cols-1 gap-2 ${currentWinner ? 'md:grid-cols-[1fr_1.1fr] md:gap-5' : ''}`}>
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b7280] md:text-sm">贏家</label>
              <div className="grid grid-cols-2 gap-1.5">
                {players.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      onWinnerChange(player.id);
                      onScoreChange(player.id, 0);
                    }}
                    className={`flex min-h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all md:min-h-12 md:text-base ${currentWinner === player.id ? 'border-[#9ca3af]/55 bg-[linear-gradient(135deg,#111827,#4b5563)] text-white shadow-[0_12px_22px_rgba(75,85,99,0.16)]' : 'border-[#d1d5db]/80 bg-white/90 text-[#4b5563] hover:border-[#9ca3af]/55 hover:text-[#111827]'}`}
                  >
                    {currentWinner === player.id ? <Trophy size={14} /> : null}
                    <span className="truncate">{player.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {currentWinner ? (
              <div className="space-y-1.5 md:space-y-2">
                <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b7280] md:text-sm">拉</label>
                <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                  {losingPlayers.map((player) => (
                    <div key={player.id} className="space-y-0.5">
                      <span className="block truncate text-[11px] font-semibold leading-tight md:text-sm">{player.name}</span>
                      <NumberInput
                        value={roundScores[player.id] || ''}
                        onChange={(value) => onScoreChange(player.id, Math.abs(parseInt(value, 10) || 0))}
                        placeholder="0"
                        className="py-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {currentWinner ? (
            <div className="mt-2 flex justify-end md:mt-8">
              <Button className="w-full md:w-auto" variant="primary" size="md" disabled={!currentWinner || disabled} onClick={onConfirm}>
                確定
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
};
