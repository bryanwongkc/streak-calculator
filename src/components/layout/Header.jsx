import React from 'react';
import { SettingsMenu } from './SettingsMenu';
import { ShareGameButton } from '../../features/games/ShareGameButton';

export const Header = ({
  game,
  games,
  activeGameId,
  onSelectGame,
  onRenameGame,
  onCreateGame,
  onDeleteGame,
  isEditingNames,
  onToggleEditNames,
  onUndo,
  onReset,
  onResetKeepNames,
}) => (
  <header className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate bg-gradient-to-r from-[#111827] via-[#4b5563] to-[#9ca3af] bg-clip-text text-base font-semibold uppercase leading-none tracking-[0.16em] text-transparent md:text-3xl">
          港式台灣牌
        </h1>
        <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280] md:text-xs">
          {game?.name || 'No active game'}
        </p>
      </div>
      {game ? (
        <div className="flex shrink-0 items-center gap-2">
          <ShareGameButton game={game} />
          <SettingsMenu
            isEditingNames={isEditingNames}
            onToggleEditNames={onToggleEditNames}
            onUndo={onUndo}
            onReset={onReset}
            onResetKeepNames={onResetKeepNames}
            canUndo={Boolean(game.history?.length)}
            games={games}
            activeGameId={activeGameId}
            onSelectGame={onSelectGame}
            onRenameGame={onRenameGame}
            onCreateGame={onCreateGame}
            onDeleteGame={onDeleteGame}
          />
        </div>
      ) : null}
    </div>
  </header>
);
