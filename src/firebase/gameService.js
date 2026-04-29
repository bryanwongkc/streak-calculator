import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { createShareToken } from '../utils/ids';
import { createDefaultGameState } from '../features/game/gameTypes';

const gamesCollection = 'games';

export const createGame = async ({ name, userId }) => {
  const gameRef = doc(db, gamesCollection, crypto.randomUUID());
  const shareToken = createShareToken();
  const game = createDefaultGameState({ name: name || 'Mahjong game' });

  await setDoc(gameRef, {
    ...game,
    shareToken,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  });

  return {
    gameId: gameRef.id,
    shareToken,
    name: game.name,
  };
};

export const subscribeToGame = (gameId, onNext, onError) => (
  onSnapshot(doc(db, gamesCollection, gameId), (snapshot) => {
    if (!snapshot.exists()) {
      onNext(null);
      return;
    }

    onNext({
      id: snapshot.id,
      ...snapshot.data(),
    });
  }, onError)
);

export const updateGame = async (gameId, patch) => {
  await updateDoc(doc(db, gamesCollection, gameId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
};

export const validateSharedGame = async (gameId, shareToken) => {
  const snapshot = await getDoc(doc(db, gamesCollection, gameId));
  if (!snapshot.exists()) {
    return { ok: false, reason: 'Game not found.' };
  }

  const data = snapshot.data();
  if (data.shareToken !== shareToken) {
    return { ok: false, reason: 'This share link is no longer valid.' };
  }

  return {
    ok: true,
    game: {
      gameId: snapshot.id,
      name: data.name,
      shareToken: data.shareToken,
    },
  };
};
