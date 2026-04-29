import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { TabBar } from '../components/common/TabBar';
import { TABS } from './tabs';
import { DEFAULT_TAB } from './routes';
import { GameTab } from '../features/game/GameTab';
import { ChipCounterTab } from '../features/chipCounter/ChipCounterTab';
import { DashboardTab } from '../features/dashboard/DashboardTab';
import { RulesTab } from '../features/rules/RulesTab';
import { CreateGameModal } from '../features/games/CreateGameModal';
import { JoinGamePanel } from '../features/games/JoinGamePanel';
import { JoinByQrModal } from '../features/games/JoinByQrModal';
import { createGame, validateSharedGame } from '../firebase/gameService';
import { ensureAnonymousUser, isFirebaseConfigured } from '../firebase/firebaseClient';
import { createLocalDemoGame, LOCAL_DEMO_GAME_ID, useGameState } from '../hooks/useGameState';
import { getStoredGames, saveStoredGame } from '../utils/storage';
import { resetGame, resetGameKeepNames, undoLastEntry } from '../features/game/gameEngine';

const parseJoinInput = (value) => {
  const input = value.trim();
  if (!input) return null;

  try {
    const url = new URL(input, window.location.origin);
    const gameId = url.searchParams.get('game');
    const token = url.searchParams.get('token');
    if (gameId && token) return { gameId, token };
  } catch {
    // Fall through to manual code parsing.
  }

  const [gameId, token] = input.split(/[\s:|,]+/).filter(Boolean);
  return gameId && token ? { gameId, token } : null;
};

const hasUrlJoinParams = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get('game') && params.get('token'));
};

export const AppShell = () => {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [storedGames, setStoredGames] = useState(() => getStoredGames());
  const [activeGameId, setActiveGameId] = useState(() => (
    isFirebaseConfigured ? getStoredGames()[0]?.gameId || '' : ''
  ));
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [joinError, setJoinError] = useState('');
  const [urlJoinPending, setUrlJoinPending] = useState(() => hasUrlJoinParams());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinQrOpen, setJoinQrOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const { game, loading, error, updateGame } = useGameState(activeGameId);

  const normalizedGame = useMemo(() => (
    game ? { ...game, id: game.id || activeGameId } : null
  ), [game, activeGameId]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    ensureAnonymousUser()
      .then(setUser)
      .catch((anonymousError) => setAuthError(anonymousError.message || 'Anonymous sign-in failed.'));
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    const token = params.get('token');
    if (!gameId || !token) {
      setUrlJoinPending(false);
      return;
    }

    let cancelled = false;
    setBusy(true);
    validateSharedGame(gameId, token)
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setJoinError('Game link not valid. Please check with the host.');
          return;
        }

        const nextGames = saveStoredGame(result.game);
        setStoredGames(nextGames);
        setActiveGameId(result.game.gameId);
        setJoinMessage(`Joined ${result.game.name}.`);
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(() => setJoinError('Game link not valid. Please check with the host.'))
      .finally(() => {
        if (!cancelled) {
          setBusy(false);
          setUrlJoinPending(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured && urlJoinPending) {
      setUrlJoinPending(false);
      setJoinError('Firebase is not configured on this deployment.');
    }
    if (authError && urlJoinPending) {
      setUrlJoinPending(false);
      setJoinError('Game link not valid. Please check with the host.');
    }
  }, [authError, urlJoinPending]);

  useEffect(() => {
    if (!normalizedGame || activeGameId === LOCAL_DEMO_GAME_ID) return;

    const nextGames = saveStoredGame({
      gameId: activeGameId,
      name: normalizedGame.name,
      shareToken: normalizedGame.shareToken,
    });
    setStoredGames(nextGames);
  }, [activeGameId, normalizedGame?.name, normalizedGame?.shareToken]);

  const handleCreateGame = async (name, players) => {
    if (!isFirebaseConfigured || !user) return;
    setBusy(true);
    setJoinError('');
    try {
      const createdGame = await createGame({ name, players, userId: user.uid });
      const nextGames = saveStoredGame(createdGame);
      setStoredGames(nextGames);
      setActiveGameId(createdGame.gameId);
      setCreateModalOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleJoinGameInput = async (value) => {
    const parsed = parseJoinInput(value);
    if (!parsed) {
      setJoinError('Game link not valid. Please check with the host.');
      return false;
    }

    setBusy(true);
    setJoinError('');
    try {
      const result = await validateSharedGame(parsed.gameId, parsed.token);
      if (!result.ok) {
        setJoinError('Game link not valid. Please check with the host.');
        return false;
      }

      const nextGames = saveStoredGame(result.game);
      setStoredGames(nextGames);
      setActiveGameId(result.game.gameId);
      setJoinMessage(`Joined ${result.game.name}.`);
      return true;
    } catch {
      setJoinError('Game link not valid. Please check with the host.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startLocalDemo = () => {
    const localGame = createLocalDemoGame();
    window.localStorage.setItem('streak-calculator-local-demo', JSON.stringify(localGame));
    setActiveGameId(LOCAL_DEMO_GAME_ID);
  };

  const handleUpdateGame = async (patch) => {
    await updateGame(patch);
  };

  const handleUndo = async () => {
    if (!normalizedGame?.history?.length) return;
    const nextState = undoLastEntry({
      history: normalizedGame.history,
      fallbackPlayers: normalizedGame.players,
    });
    if (nextState) {
      await updateGame(nextState);
      setShowAdjustments(false);
    }
  };

  const handleReset = async () => {
    await updateGame(resetGame());
    setShowAdjustments(false);
  };

  const handleResetKeepNames = async () => {
    await updateGame(resetGameKeepNames(normalizedGame.players));
    setShowAdjustments(false);
  };

  const gamesForSwitcher = activeGameId === LOCAL_DEMO_GAME_ID
    ? [{ gameId: LOCAL_DEMO_GAME_ID, name: 'Local demo game' }, ...storedGames]
    : storedGames;

  if (!normalizedGame && (urlJoinPending || loading)) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] p-3 text-[#1f2937] md:p-8">
        <div className="mx-auto flex min-h-[80vh] max-w-sm items-center justify-center text-center text-sm text-[#6b7280]">
          Opening shared game...
        </div>
      </main>
    );
  }

  if (!normalizedGame && !loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] p-3 text-[#1f2937] md:p-8">
        <div className="mx-auto flex min-h-[88vh] max-w-5xl items-center justify-center">
          <JoinGamePanel
            firebaseReady={isFirebaseConfigured && !authError}
            message={authError || joinMessage}
            joinError={joinError}
            onCreateGame={() => setCreateModalOpen(true)}
            onJoinGame={handleJoinGameInput}
            onOpenQrJoin={() => setJoinQrOpen(true)}
            onStartLocalDemo={startLocalDemo}
            busy={busy || !user}
          />
        </div>
        <CreateGameModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateGame}
          busy={busy || !user}
        />
        <JoinByQrModal
          open={joinQrOpen}
          onClose={() => setJoinQrOpen(false)}
          onJoin={handleJoinGameInput}
          busy={busy || !user}
          error={joinError}
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f5f6f8] p-2 text-[#1f2937] md:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.62),_transparent_34%),radial-gradient(circle_at_18%_22%,_rgba(203,213,225,0.22),_transparent_28%),radial-gradient(circle_at_84%_10%,_rgba(148,163,184,0.12),_transparent_24%),linear-gradient(180deg,_rgba(245,246,248,0.95),_rgba(234,237,241,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.48)_0%,_transparent_18%,_transparent_82%,_rgba(148,163,184,0.08)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-3 pb-20 md:space-y-6">
        <Header
          game={normalizedGame}
          games={gamesForSwitcher}
          activeGameId={activeGameId}
          onSelectGame={setActiveGameId}
          onCreateGame={() => setCreateModalOpen(true)}
          isEditingNames={isEditingNames}
          onToggleEditNames={() => setIsEditingNames((value) => !value)}
          showAdjustments={showAdjustments}
          onToggleAdjustments={() => setShowAdjustments((value) => !value)}
          onUndo={handleUndo}
          onReset={handleReset}
          onResetKeepNames={handleResetKeepNames}
        />

        {error || joinMessage ? (
          <div className="rounded-lg border border-[#d1d5db]/80 bg-white/85 px-3 py-2 text-sm text-[#6b7280]">
            {error || joinMessage}
          </div>
        ) : null}

        {loading || !normalizedGame ? (
          <div className="rounded-xl border border-[#d1d5db]/80 bg-white/80 p-8 text-center text-[#6b7280]">Loading game...</div>
        ) : (
          <>
            {activeTab === 'game' ? (
              <GameTab
                game={normalizedGame}
                onUpdateGame={handleUpdateGame}
                isEditingNames={isEditingNames}
                showAdjustments={showAdjustments}
                onCloseAdjustments={() => setShowAdjustments(false)}
                onAfterAction={() => setShowAdjustments(false)}
                disabled={busy}
              />
            ) : null}
            {activeTab === 'chips' ? <ChipCounterTab game={normalizedGame} onUpdateGame={handleUpdateGame} disabled={busy} /> : null}
            {activeTab === 'dashboard' ? <DashboardTab game={normalizedGame} /> : null}
            {activeTab === 'rules' ? (
              <RulesTab
                game={normalizedGame}
                user={user}
                onUpdateGame={handleUpdateGame}
                firebaseReady={isFirebaseConfigured && activeGameId !== LOCAL_DEMO_GAME_ID}
              />
            ) : null}
          </>
        )}

        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <CreateGameModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateGame}
        busy={busy || !user}
      />
    </main>
  );
};
