import React from 'react';
import { Plus, Swords, Trophy, X } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';
import { ManualAdjustmentsPanel } from './ManualAdjustmentsPanel';

export const RoundInput = ({
  players,
  roundEntries,
  onEntryWinnerChange,
  onEntryScoreChange,
  onAddEntry,
  onRemoveEntry,
  hasDuplicateWinPair,
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
  const hasValidWinEvent = roundEntries.some((entry) => (
    entry.winnerId &&
    Object.entries(entry.roundScores || {}).some(([playerId, amount]) => (
      playerId !== entry.winnerId && Number(amount) > 0
    ))
  ));

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
          <div className="space-y-2.5 md:space-y-4">
            {roundEntries.map((entry, entryIndex) => {
              const losingPlayers = entry.winnerId
                ? players.filter((player) => player.id !== entry.winnerId)
                : [];

              return (
                <div
                  key={entry.id}
                  className={`${entryIndex > 0 ? 'border-t border-[#e5e7eb] pt-2.5 md:pt-4' : ''}`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b7280] md:text-sm">
                      Entry {entryIndex + 1}
                    </label>
                    {entryIndex > 0 ? (
                      <button
                        type="button"
                        aria-label="Remove entry"
                        title="Remove entry"
                        onClick={() => onRemoveEntry(entry.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d1d5db]/80 bg-white text-[#6b7280] transition hover:text-[#111827]"
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>

                  <div className={`grid grid-cols-1 gap-2 ${entry.winnerId ? 'md:grid-cols-[1fr_1.1fr] md:gap-5' : ''}`}>
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b7280] md:text-sm">贏家</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {players.map((player) => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => onEntryWinnerChange(entry.id, player.id)}
                            className={`flex min-h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all md:min-h-12 md:text-base ${entry.winnerId === player.id ? 'border-[#9ca3af]/55 bg-[linear-gradient(135deg,#111827,#4b5563)] text-white shadow-[0_12px_22px_rgba(75,85,99,0.16)]' : 'border-[#d1d5db]/80 bg-white/90 text-[#4b5563] hover:border-[#9ca3af]/55 hover:text-[#111827]'}`}
                          >
                            {entry.winnerId === player.id ? <Trophy size={14} /> : null}
                            <span className="truncate">{player.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {entry.winnerId ? (
                      <div className="space-y-1.5 md:space-y-2">
                        <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b7280] md:text-sm">拉</label>
                        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                          {losingPlayers.map((player) => (
                            <div key={player.id} className="space-y-0.5">
                              <span className="block truncate text-[11px] font-semibold leading-tight md:text-sm">{player.name}</span>
                              <NumberInput
                                value={entry.roundScores[player.id] || ''}
                                onChange={(value) => onEntryScoreChange(entry.id, player.id, Math.abs(parseInt(value, 10) || 0))}
                                placeholder="0"
                                className="py-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex flex-col gap-2 md:mt-8 md:flex-row md:justify-between">
            <Button className="w-full md:w-auto" size="md" onClick={onAddEntry} disabled={disabled}>
              <Plus size={16} /> +
            </Button>
            {hasDuplicateWinPair ? (
              <p className="text-xs font-semibold text-[#991b1b] md:self-center">
                Duplicate winner/loser pair in this round.
              </p>
            ) : null}
            <Button className="w-full md:w-auto" variant="primary" size="md" disabled={!hasValidWinEvent || hasDuplicateWinPair || disabled} onClick={onConfirm}>
              確定
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
