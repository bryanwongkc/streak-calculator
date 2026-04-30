import React from 'react';
import { Flame } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/common/TextInput';

export const PlayerCards = ({
  players,
  lastWinner,
  history = [],
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
  const latestRounds = history.filter((entry) => entry.winner && entry.winner !== 'SYSTEM');
  const activeStreakCount = latestRounds.reduce((count, entry, index) => {
    if (!lastWinner || entry.winner !== lastWinner) return count;
    if (index !== count) return count;
    return count + 1;
  }, 0);
  const visibleStreakCount = Math.max(activeStreakCount, lastWinner ? 1 : 0);

  return (
    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-4">
      {players.map((player) => (
        <Card
          key={player.id}
          className={`p-2 transition-all duration-300 md:p-5 ${lastWinner === player.id ? 'border-[#9ca3af]/55 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.98))]' : ''}`}
        >
          <div className="flex items-center justify-between gap-1.5">
            {isEditingNames ? (
              <TextInput
                value={player.name}
                onChange={(event) => onNameChange(player.id, event.target.value)}
                className="px-2 py-1 text-base font-semibold md:text-lg"
              />
            ) : (
              <h3 className="truncate text-base font-semibold leading-tight tracking-[0.02em] text-[#1f2937] md:text-xl">
                {player.name}
              </h3>
            )}
            {lastWinner === player.id ? (
              <div
                className="flex max-w-[4.25rem] shrink-0 flex-wrap justify-end gap-0.5"
                aria-label={`${visibleStreakCount} win streak`}
                title={`${visibleStreakCount} win streak`}
              >
                {Array.from({ length: visibleStreakCount }).map((_, index) => (
                  <Flame
                    key={index}
                    className="shrink-0 fill-[#fed7aa] text-[#ea580c] drop-shadow-[0_1px_2px_rgba(234,88,12,0.22)]"
                    size={14}
                    strokeWidth={2.5}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-1.5 grid grid-cols-2 gap-1.5 md:mt-4 md:block md:space-y-3">
            <div className="min-w-0">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7356]">總數</p>
              <p className={`font-mono text-[22px] leading-none md:text-2xl ${player.total >= 0 ? 'text-[#374151]' : 'text-[#6b7280]'}`}>
                {player.total.toFixed(0)}
              </p>
            </div>
            <div className="min-w-0 border-l border-[#e5e7eb] pl-1.5 md:border-l-0 md:border-t md:pl-0 md:pt-2">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7356]">拉</p>
              <p className={`font-mono text-base leading-none md:text-xl ${player.debt > 0 ? 'text-[#dc2626]' : player.id === dangerId ? 'text-[#374151]' : 'text-[#9ca3af]'}`}>
                {player.debt > 0 ? `-${player.debt.toFixed(0)}` : '0'}
              </p>
            </div>
          </div>

          {leaderId === player.id ? (
            <div className="mt-2 hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7280] md:block">Leader</div>
          ) : null}
        </Card>
      ))}
    </div>
  );
};
