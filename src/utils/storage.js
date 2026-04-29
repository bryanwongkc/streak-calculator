export const GAME_LIST_STORAGE_KEY = 'streak-calculator-games';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const readLocalJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
};

export const writeLocalJson = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getStoredGames = () => readLocalJson(GAME_LIST_STORAGE_KEY, []);

export const saveStoredGame = (game) => {
  const storedGames = getStoredGames();
  const nextGame = { ...game, lastOpenedAt: new Date().toISOString() };
  const nextGames = [
    nextGame,
    ...storedGames.filter((item) => item.gameId !== game.gameId),
  ].slice(0, 20);

  writeLocalJson(GAME_LIST_STORAGE_KEY, nextGames);
  return nextGames;
};

export const removeStoredGame = (gameId) => {
  const nextGames = getStoredGames().filter((item) => item.gameId !== gameId);
  writeLocalJson(GAME_LIST_STORAGE_KEY, nextGames);
  return nextGames;
};
