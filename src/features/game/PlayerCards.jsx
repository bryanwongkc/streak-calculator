import React from 'react';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/common/TextInput';
import { getActiveDebtPockets, getPlayerName } from './gameEngine';

export const PlayerCards = ({
  players,
  isEditingNames,
  onNameChange,
}) => {
  const leader = players.reduce((best, player) => (
    player.total > best.total ? player : best
  ), players[0]);
  const leaderId = leader?.total > 0 ? leader.id : null;

  return (
    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-4">
      {players.map((player) => (
        <Card key={player.id} className="p-2 transition-all duration-300 md:p-5">
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
          </div>

          <div className="mt-1.5 md:mt-4">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7356]">總數</p>
            <p className={`font-mono text-[22px] leading-none md:text-2xl ${player.total >= 0 ? 'text-[#374151]' : 'text-[#6b7280]'}`}>
              {player.total.toFixed(0)}
            </p>
          </div>

          {leaderId === player.id ? (
            <div className="mt-2 hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7280] md:block">Leader</div>
          ) : null}
        </Card>
      ))}
    </div>
  );
};

export const ActiveDebtPocketsCard = ({ players }) => {
  const activeDebtPockets = getActiveDebtPockets(players);

  return (
    <Card className="p-2.5 md:p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-[0.08em] text-[#1f2937] md:text-base">Active debt pockets</h2>
      </div>
      {activeDebtPockets.length ? (
        <div className="grid grid-cols-1 gap-1.5 text-sm text-[#374151] md:grid-cols-2">
          {activeDebtPockets.map((pocket) => (
            <div
              key={`${pocket.debtorId}-${pocket.ownerId}`}
              className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc]/90 px-2.5 py-1.5"
            >
              <span className="font-semibold">{getPlayerName(players, pocket.debtorId)}</span>
              {' owes '}
              <span className="font-semibold">{getPlayerName(players, pocket.ownerId)}</span>
              {': '}
              <span className="font-mono font-bold">{pocket.amount.toFixed(0)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6b7280]">No active debt pockets</p>
      )}
    </Card>
  );
};
