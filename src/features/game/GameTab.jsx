import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { INITIAL_PLAYERS } from './gameTypes';
import { applyManualAdjustment, processRound } from './gameEngine';
import { PlayerCards } from './PlayerCards';
import { RoundInput } from './RoundInput';
import { HistoryLog } from './HistoryLog';
import { ManualAdjustmentsPanel } from './ManualAdjustmentsPanel';

const emptyValues = (players) => players.reduce((values, player) => ({ ...values, [player.id]: 0 }), {});

export const GameTab = ({
  game,
  onUpdateGame,
  isEditingNames,
  showAdjustments,
  onCloseAdjustments,
  onAfterAction,
  disabled,
}) => {
  const players = game?.players || INITIAL_PLAYERS;
  const history = game?.history || [];
  const [currentWinner, setCurrentWinner] = useState('');
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
    onCloseAdjustments?.();
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {showAdjustments ? (
        <ManualAdjustmentsPanel
          players={players}
          values={adjValues}
          remarks={adjRemarks}
          onValueChange={(id, value) => setAdjValues((prev) => ({ ...prev, [id]: value }))}
          onRemarksChange={setAdjRemarks}
          onCancel={onCloseAdjustments}
          onApply={handleAdjustmentApply}
          disabled={disabled}
        />
      ) : null}

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
        disabled={disabled}
      />

      <HistoryLog history={history} players={players} />

      <details className="rounded-xl border border-[#d1d5db]/80 bg-white/80 p-3.5 text-xs text-[#6b7280] backdrop-blur-xl md:p-5">
        <summary className="flex cursor-pointer select-none items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1f2937]">
          <Info size={14} className="text-[#6b7280]" /> Rules reference
        </summary>
        <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
          <p><strong>Streak:</strong> Same winner keeps the banked totals in place and loser debt grows by debt x 1.5 plus the round loss.</p>
          <p><strong>Slaying king:</strong> A winner with existing debt pays half only when the previous winner loses this round; others settle in full.</p>
          <p><strong>Adjustment:</strong> Changes banked totals only. Current debt remains available for the next settlement.</p>
        </div>
      </details>

    </div>
  );
};
