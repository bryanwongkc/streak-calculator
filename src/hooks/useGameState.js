import { useCallback, useEffect, useState } from 'react';
import { isFirebaseConfigured } from '../firebase/firebaseClient';
import { subscribeToGame, updateGame as updateRemoteGame } from '../firebase/gameService';
import { createDefaultGameState } from '../features/game/gameTypes';
import { readLocalJson, writeLocalJson } from '../utils/storage';

const LOCAL_DEMO_KEY = 'streak-calculator-local-demo';

export const LOCAL_DEMO_GAME_ID = 'local-demo';

export const createLocalDemoGame = () => ({
  id: LOCAL_DEMO_GAME_ID,
  shareToken: '',
  createdBy: 'local',
  ...createDefaultGameState({ name: 'Local demo game' }),
});

export const useGameState = (gameId) => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(Boolean(gameId));
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');

    if (!gameId) {
      setGame(null);
      setLoading(false);
      return undefined;
    }

    if (gameId === LOCAL_DEMO_GAME_ID || !isFirebaseConfigured) {
      const localGame = readLocalJson(LOCAL_DEMO_KEY, createLocalDemoGame());
      setGame(localGame);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeToGame(
      gameId,
      (nextGame) => {
        setGame(nextGame);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Unable to load game.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [gameId]);

  const updateGame = useCallback(async (patch) => {
    if (!gameId) return;

    if (gameId === LOCAL_DEMO_GAME_ID || !isFirebaseConfigured) {
      setGame((current) => {
        const nextGame = {
          ...(current || createLocalDemoGame()),
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        writeLocalJson(LOCAL_DEMO_KEY, nextGame);
        return nextGame;
      });
      return;
    }

    await updateRemoteGame(gameId, patch);
  }, [gameId]);

  return {
    game,
    loading,
    error,
    updateGame,
  };
};
