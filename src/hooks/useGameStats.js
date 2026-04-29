import { useMemo } from 'react';
import { deriveGameStats } from '../features/dashboard/statsEngine';

export const useGameStats = (game) => (
  useMemo(() => deriveGameStats(game?.players || [], game?.history || []), [game])
);
