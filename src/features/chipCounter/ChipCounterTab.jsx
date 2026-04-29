import React, { useMemo, useState } from 'react';
import { ChipColorConfig } from './ChipColorConfig';
import { InitialStackEditor } from './InitialStackEditor';
import { CurrentStackEditor } from './CurrentStackEditor';
import { ensureInitialCounts } from './chipMath';
import { createDefaultChipConfig } from '../game/gameTypes';
import { useLocalChipCounts } from '../../hooks/useLocalChipCounts';

export const ChipCounterTab = ({ game, onUpdateGame, disabled }) => {
  const players = game.players || [];
  const chipConfig = game.chipConfig || createDefaultChipConfig(players);
  const colors = chipConfig.colors || [];
  const initialCountsByPlayer = ensureInitialCounts(players, colors, chipConfig.initialCountsByPlayer);
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id);
  const [currentCounts, setCurrentCounts] = useLocalChipCounts(game.id, colors);

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId) || players[0],
    [players, selectedPlayerId]
  );
  const effectiveSelectedPlayerId = selectedPlayer?.id || selectedPlayerId;

  const updateChipConfig = (patch) => onUpdateGame({
    chipConfig: {
      ...chipConfig,
      ...patch,
    },
  });

  const handleColorsChange = (nextColors) => {
    updateChipConfig({
      colors: nextColors,
      initialCountsByPlayer: ensureInitialCounts(players, nextColors, initialCountsByPlayer),
    });
  };

  const handleInitialCountChange = (playerId, colorId, value) => {
    updateChipConfig({
      initialCountsByPlayer: {
        ...initialCountsByPlayer,
        [playerId]: {
          ...initialCountsByPlayer[playerId],
          [colorId]: value,
        },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
      <div className="space-y-3">
        <ChipColorConfig colors={colors} onChange={handleColorsChange} disabled={disabled} />
        <InitialStackEditor
          players={players}
          colors={colors}
          selectedPlayerId={effectiveSelectedPlayerId}
          onSelectedPlayerChange={setSelectedPlayerId}
          initialCounts={initialCountsByPlayer}
          onCountsChange={handleInitialCountChange}
          disabled={disabled}
        />
      </div>
      <CurrentStackEditor
        colors={colors}
        selectedPlayer={selectedPlayer}
        initialCounts={initialCountsByPlayer[effectiveSelectedPlayerId] || {}}
        currentCounts={currentCounts}
        onCurrentCountsChange={(colorId, value) => setCurrentCounts((prev) => ({ ...prev, [colorId]: value }))}
      />
    </div>
  );
};
