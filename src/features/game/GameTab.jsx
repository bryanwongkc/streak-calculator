import React, { useMemo, useState } from 'react';
import { INITIAL_PLAYERS } from './gameTypes';
import { applyManualAdjustment, normalizePlayerDebts, processRound } from './gameEngine';
import { ActiveDebtPocketsCard, PlayerCards } from './PlayerCards';
import { RoundInput } from './RoundInput';
import { HistoryLog } from './HistoryLog';

const emptyValues = (players) => players.reduce((values, player) => ({ ...values, [player.id]: 0 }), {});

const createRoundEntry = (players) => ({
  id: `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  winnerId: '',
  roundScores: emptyValues(players),
});

const getWinEventsFromEntries = (roundEntries) => (
  roundEntries.flatMap((entry) => (
    Object.entries(entry.roundScores || {})
      .filter(([playerId, amount]) => playerId !== entry.winnerId && Number(amount) > 0)
      .map(([loserId, amount]) => ({
        winnerId: entry.winnerId,
        loserId,
        amount: Number(amount),
      }))
  ))
);

const hasDuplicateWinPair = (winEvents) => {
  const seenPairs = new Set();

  return winEvents.some((event) => {
    const key = `${event.loserId}->${event.winnerId}`;
    if (seenPairs.has(key)) return true;
    seenPairs.add(key);
    return false;
  });
};

export const GameTab = ({
  game,
  onUpdateGame,
  isEditingNames,
  onAfterAction,
  disabled,
}) => {
  const players = normalizePlayerDebts(game?.players || INITIAL_PLAYERS);
  const history = game?.history || [];
  const [actionTab, setActionTab] = useState('round');
  const [roundEntries, setRoundEntries] = useState(() => [createRoundEntry(players)]);
  const [adjValues, setAdjValues] = useState(() => emptyValues(players));
  const [adjRemarks, setAdjRemarks] = useState('');

  const blankValues = useMemo(() => emptyValues(players), [players]);
  const currentWinEvents = useMemo(() => getWinEventsFromEntries(roundEntries), [roundEntries]);
  const hasDuplicateRoundPair = useMemo(() => hasDuplicateWinPair(currentWinEvents), [currentWinEvents]);

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
    if (hasDuplicateRoundPair) return;

    const nextState = processRound({
      players,
      history,
      winEvents: currentWinEvents,
    });

    if (!nextState) return;
    await updateGame(nextState);
    setRoundEntries([createRoundEntry(players)]);
  };

  const handleEntryWinnerChange = (entryId, winnerId) => {
    setRoundEntries((entries) => entries.map((entry) => (
      entry.id === entryId
        ? {
          ...entry,
          winnerId,
          roundScores: { ...entry.roundScores, [winnerId]: 0 },
        }
        : entry
    )));
  };

  const handleEntryScoreChange = (entryId, playerId, value) => {
    setRoundEntries((entries) => entries.map((entry) => (
      entry.id === entryId
        ? { ...entry, roundScores: { ...entry.roundScores, [playerId]: value } }
        : entry
    )));
  };

  const handleAddRoundEntry = () => {
    setRoundEntries((entries) => [...entries, createRoundEntry(players)]);
  };

  const handleRemoveRoundEntry = (entryId) => {
    setRoundEntries((entries) => (
      entries.length === 1 ? entries : entries.filter((entry) => entry.id !== entryId)
    ));
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
    <div className="space-y-1.5 md:space-y-6">
      <PlayerCards
        players={players}
        isEditingNames={isEditingNames}
        onNameChange={handleNameUpdate}
      />
      <ActiveDebtPocketsCard players={players} />

      <RoundInput
        players={players}
        roundEntries={roundEntries}
        onEntryWinnerChange={handleEntryWinnerChange}
        onEntryScoreChange={handleEntryScoreChange}
        onAddEntry={handleAddRoundEntry}
        onRemoveEntry={handleRemoveRoundEntry}
        hasDuplicateWinPair={hasDuplicateRoundPair}
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
