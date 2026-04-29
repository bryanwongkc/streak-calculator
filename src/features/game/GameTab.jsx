import React, { useMemo, useState } from 'react';
import { INITIAL_PLAYERS } from './gameTypes';
import { applyManualAdjustment, processRound } from './gameEngine';
import { PlayerCards } from './PlayerCards';
import { RoundInput } from './RoundInput';
import { HistoryLog } from './HistoryLog';

const emptyValues = (players) => players.reduce((values, player) => ({ ...values, [player.id]: 0 }), {});

export const GameTab = ({
  game,
  onUpdateGame,
  isEditingNames,
  onAfterAction,
  disabled,
}) => {
  const players = game?.players || INITIAL_PLAYERS;
  const history = game?.history || [];
  const [currentWinner, setCurrentWinner] = useState('');
  const [actionTab, setActionTab] = useState('round');
  const [roundScores, setRoundScores] = useState(() => emptyValues(players));
  const [adjValues, setAdjValues] = useState(() => emptyValues(players));
  const [adjRemarks, setAdjRemarks] = useState('');

  const blankValues = useMemo(() => emptyValues(players), [players]);

  const updateGame = async (patch) => {
    await onUpdateGame(patch);
    onAfterAction?.();
  };

  const handleNameUpdate = (id, name) => {
    updateGame({
      players: players.map((player) => (player.id === id ? { ...player, name } : player)),
    });
  };

  const handleRoundConfirm = async () => {
    const nextState = processRound({
      players,
      lastWinner: game.lastWinner,
      history,
      currentWinner,
      roundScores,
    });

    if (!nextState) return;
    await updateGame(nextState);
    setCurrentWinner('');
    setRoundScores(blankValues);
  };

  const handleAdjustmentApply = async () => {
    const nextState = applyManualAdjustment({
      players,
      history,
      values: adjValues,
      remarks: adjRemarks,
    });

    await updateGame(nextState);
    setAdjValues(blankValues);
    setAdjRemarks('');
    setActionTab('round');
  };

  return (
    <div className="space-y-2 md:space-y-6">
      <PlayerCards
        players={players}
        lastWinner={game.lastWinner}
        isEditingNames={isEditingNames}
        onNameChange={handleNameUpdate}
      />

      <RoundInput
        players={players}
        currentWinner={currentWinner}
        roundScores={roundScores}
        onWinnerChange={setCurrentWinner}
        onScoreChange={(id, value) => setRoundScores((prev) => ({ ...prev, [id]: value }))}
        onConfirm={handleRoundConfirm}
        actionTab={actionTab}
        onActionTabChange={setActionTab}
        adjustmentValues={adjValues}
        adjustmentRemarks={adjRemarks}
        onAdjustmentValueChange={(id, value) => setAdjValues((prev) => ({ ...prev, [id]: value }))}
        onAdjustmentRemarksChange={setAdjRemarks}
        onAdjustmentCancel={() => setActionTab('round')}
        onAdjustmentApply={handleAdjustmentApply}
        disabled={disabled}
      />

      <HistoryLog history={history} players={players} />
    </div>
  );
};
