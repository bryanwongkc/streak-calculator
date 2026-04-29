import React from 'react';
import { RotateCw, Swords, Trophy } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';

export const RoundInput = ({
  players,
  currentWinner,
  roundScores,
  onWinnerChange,
  onScoreChange,
  onConfirm,
  disabled,
}) => (
  <Card className="p-3 md:p-6">
    <div className="mb-3 flex items-center gap-2 md:mb-6">
      <Swords className="text-[#6b7280]" />
      <h2 className="text-lg font-bold text-[#1f2937] md:text-xl">Winning hand</h2>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      <div className="space-y-2">
        <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280] md:text-sm">Winner</label>
        <div className="grid grid-cols-2 gap-1.5">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => onWinnerChange(player.id)}
              className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all md:min-h-12 md:text-base ${currentWinner === player.id ? 'border-[#9ca3af]/55 bg-[linear-gradient(135deg,#111827,#4b5563)] text-white shadow-[0_14px_28px_rgba(75,85,99,0.18)]' : 'border-[#d1d5db]/80 bg-white/90 text-[#4b5563] hover:border-[#9ca3af]/55 hover:text-[#111827]'}`}
            >
              {currentWinner === player.id ? <Trophy size={14} /> : null}
              <span className="truncate">{player.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280] md:text-sm">Loser scores</label>
        <div className="grid grid-cols-2 gap-2">
          {players.map((player) => (
            <div key={player.id} className={`space-y-1 ${currentWinner === player.id ? 'opacity-30' : ''}`}>
              <span className="block truncate text-[11px] font-semibold md:text-sm">{player.name}</span>
              <NumberInput
                disabled={currentWinner === player.id}
                value={roundScores[player.id] || ''}
                onChange={(value) => onScoreChange(player.id, Math.abs(parseInt(value, 10) || 0))}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-4 flex justify-end md:mt-8">
      <Button className="w-full md:w-auto" variant="primary" size="lg" disabled={!currentWinner || disabled} onClick={onConfirm} icon={RotateCw}>
        Confirm update
      </Button>
    </div>
  </Card>
);
