import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const GameSwitcher = ({ games, activeGameId, onSelectGame, onCreateGame }) => (
  <div className="flex items-center gap-2">
    <select
      value={activeGameId || ''}
      onChange={(event) => onSelectGame(event.target.value)}
      className="min-w-0 flex-1 rounded-lg border border-[#d1d5db]/80 bg-white/90 px-3 py-2 text-sm font-semibold text-[#374151] outline-none focus:ring-2 focus:ring-[#9ca3af]/40"
      aria-label="Switch game"
    >
      {games.length === 0 ? <option value="">No games</option> : null}
      {games.map((game) => (
        <option key={game.gameId} value={game.gameId}>{game.name}</option>
      ))}
    </select>
    <Button size="icon" variant="secondary" onClick={onCreateGame} icon={Plus} aria-label="Create game" />
  </div>
);
