import { useEffect, useMemo, useState } from 'react';
import { readLocalJson, writeLocalJson } from '../utils/storage';

export const getChipCountsStorageKey = (gameId) => `chip-counts-${gameId}`;

export const useLocalChipCounts = (gameId, colors) => {
  const storageKey = getChipCountsStorageKey(gameId || 'none');
  const blankCounts = useMemo(() => (
    colors.reduce((counts, color) => ({ ...counts, [color.id]: 0 }), {})
  ), [colors]);

  const [counts, setCounts] = useState(() => readLocalJson(storageKey, blankCounts));

  useEffect(() => {
    setCounts(readLocalJson(storageKey, blankCounts));
  }, [storageKey, blankCounts]);

  useEffect(() => {
    if (!gameId) return;
    writeLocalJson(storageKey, counts);
  }, [counts, gameId, storageKey]);

  return [counts, setCounts, blankCounts];
};
