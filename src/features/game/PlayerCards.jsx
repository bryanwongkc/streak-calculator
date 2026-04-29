import React from 'react';
import { Flame } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/common/TextInput';

export const PlayerCards = ({
  players,
  lastWinner,
  isEditingNames,
  onNameChange,
}) => {
  const leader = players.reduce((best, player) => (
    player.total > best.total ? player : best
  ), players[0]);
  const leaderId = leader?.total > 0 ? leader.id : null;
  const dangerPlayer = players.reduce((worst, player) => (
    player.debt > worst.debt ? player : worst
  ), players[0]);
  const dangerId = dangerPlayer?.debt > 0 ? dangerPlayer.id : null;

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
      {players.map((player) => (
        <Card
          key={player.id}
          className={`p-2.5 transition-all duration-300 md:p-5 ${lastWinner === player.id ? 'border-[#9ca3af]/55 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.98))]' : ''}`}
        >
          <div className="flex h-4 justify-end md:mb-3">
            {lastWinner === player.id ? <Flame className="animate-pulse text-[#6b7280]" size={14} /> : null}
          </div>

          {isEditingNames ? (
            <TextInput
              value={player.name}
              onChange={(event) => onNameChange(player.id, event.target.value)}
              className="px-2 py-1 text-sm font-semibold md:text-lg"
            />
          ) : (
            <h3 className="truncate text-sm font-semibold tracking-[0.03em] text-[#1f2937] md:text-xl">
              {player.name}
            </h3>
          )}

          <div className="mt-2 space-y-2 md:mt-4 md:space-y-3">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7356]">Total</p>
              <p className={`font-mono text-base leading-none md:text-2xl ${player.total >= 0 ? 'text-[#374151]' : 'text-[#6b7280]'}`}>
                {player.total.toFixed(0)}
              </p>
            </div>
            <div className="border-t border-[#e5e7eb] pt-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7356]">Debt</p>
              <p className={`font-mono text-sm leading-none md:text-xl ${player.id === dangerId || player.debt > 0 ? 'text-[#374151]' : 'text-[#9ca3af]'}`}>
                {player.debt > 0 ? `-${player.debt.toFixed(0)}` : '0'}
              </p>
            </div>
          </div>

          {leaderId === player.id ? (
            <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7280]">Leader</div>
          ) : null}
        </Card>
      ))}
    </div>
  );
};
