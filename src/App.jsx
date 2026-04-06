import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Swords, Flame, RotateCcw, History, RotateCw, Info, Settings2, CheckCircle2, MessageSquare, UserCircle, XCircle, Undo2, Maximize2, Minimize2 } from 'lucide-react';

const INITIAL_PLAYERS = [
  { id: 'P1', name: 'Player 1', total: 0, debt: 0 },
  { id: 'P2', name: 'Player 2', total: 0, debt: 0 },
  { id: 'P3', name: 'Player 3', total: 0, debt: 0 },
  { id: 'P4', name: 'Player 4', total: 0, debt: 0 },
];

const STORAGE_KEY = 'streak-calculator-state';

const loadSavedState = () => {
  if (typeof window === 'undefined') {
    return {
      players: INITIAL_PLAYERS,
      lastWinner: null,
      history: [],
    };
  }

  try {
    const savedState = window.localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
      return {
        players: INITIAL_PLAYERS,
        lastWinner: null,
        history: [],
      };
    }

    const parsedState = JSON.parse(savedState);

    return {
      players: Array.isArray(parsedState.players) ? parsedState.players : INITIAL_PLAYERS,
      lastWinner: parsedState.lastWinner ?? null,
      history: Array.isArray(parsedState.history) ? parsedState.history : [],
    };
  } catch {
    return {
      players: INITIAL_PLAYERS,
      lastWinner: null,
      history: [],
    };
  }
};

const App = () => {
  const settingsMenuRef = useRef(null);
  const [players, setPlayers] = useState(() => loadSavedState().players);
  const [lastWinner, setLastWinner] = useState(() => loadSavedState().lastWinner);
  const [history, setHistory] = useState(() => loadSavedState().history);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  // UI States
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Input State for Rounds
  const [currentWinner, setCurrentWinner] = useState('');
  const [roundScores, setRoundScores] = useState({ P1: 0, P2: 0, P3: 0, P4: 0 });

  // Input State for Manual Adjustments
  const [adjValues, setAdjValues] = useState({ P1: 0, P2: 0, P3: 0, P4: 0 });
  const [adjRemarks, setAdjRemarks] = useState('');

  const handleScoreChange = (id, val) => {
    setRoundScores(prev => ({ ...prev, [id]: Math.abs(parseInt(val) || 0) }));
  };

  const handleAdjChange = (id, val) => {
    setAdjValues(prev => ({ ...prev, [id]: parseInt(val) || 0 }));
  };

  const handleNameUpdate = (id, newName) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const getPlayerName = (id) => {
    return players.find(p => p.id === id)?.name || id;
  };

  const leader = players.reduce((best, player) => (
    player.total > best.total ? player : best
  ), players[0]);
  const leaderId = leader?.total > 0 ? leader.id : null;
  const dangerPlayer = players.reduce((worst, player) => (
    player.debt > worst.debt ? player : worst
  ), players[0]);
  const dangerId = dangerPlayer?.debt > 0 ? dangerPlayer.id : null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!showSettingsMenu) return;

    const handlePointerDown = (event) => {
      if (!settingsMenuRef.current?.contains(event.target)) {
        setShowSettingsMenu(false);
        setShowResetConfirm(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowSettingsMenu(false);
        setShowResetConfirm(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSettingsMenu]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        players,
        lastWinner,
        history,
      })
    );
  }, [players, lastWinner, history]);

  const getLastWinnerFromHistory = (entries) => {
    return entries.find(entry => entry.winner !== "SYSTEM")?.winner || null;
  };

  const applyAdjustments = () => {
    const nextPlayersState = players.map(p => ({
      ...p,
      total: p.total + (adjValues[p.id] || 0)
    }));

    setPlayers(nextPlayersState);
    
    setHistory(prev => [{
      round: prev.length + 1,
      winner: "SYSTEM",
      type: "Adjustment",
      details: adjRemarks || "Manual adjustment to banked totals.",
      scores: JSON.parse(JSON.stringify(nextPlayersState))
    }, ...prev]);

    setAdjValues({ P1: 0, P2: 0, P3: 0, P4: 0 });
    setAdjRemarks('');
    setShowAdjustments(false);
    setShowSettingsMenu(false);
  };

  const processRound = () => {
    if (!currentWinner) return;

    let nextPlayersState = JSON.parse(JSON.stringify(players));
    let logMessage = "";
    let ruleType = "";

    const currentLoserIds = Object.keys(roundScores).filter(id => id !== currentWinner && roundScores[id] > 0);
    
    const isSlayingKing = lastWinner && 
                         currentWinner !== lastWinner && 
                         currentLoserIds.includes(lastWinner) && 
                         players.find(p => p.id === currentWinner).debt > 0;

    if (currentWinner === lastWinner) {
      ruleType = "拉";
      logMessage = `${getPlayerName(currentWinner)} 拉`;
      nextPlayersState = nextPlayersState.map(p => {
        if (currentLoserIds.includes(p.id)) {
          return { ...p, debt: Math.ceil((p.debt * 1.5) + roundScores[p.id]) };
        }
        return p;
      });
    } else if (isSlayingKing) {
      ruleType = "劈半!";
      logMessage = `${getPlayerName(currentWinner)} 反勝 ${getPlayerName(lastWinner)}! ${getPlayerName(currentWinner)} 劈半!`;
      
      let totalSettlement = 0;
      nextPlayersState = nextPlayersState.map(p => {
        if (p.id === currentWinner) {
          const payment = Math.ceil(p.debt * 0.5);
          totalSettlement += payment;
          return { ...p, total: p.total - payment, debt: 0 };
        } else if (p.id !== lastWinner) {
          const payment = p.debt;
          totalSettlement += payment;
          return { ...p, total: p.total - p.debt, debt: 0 };
        }
        return p;
      });
      nextPlayersState = nextPlayersState.map(p => 
        p.id === lastWinner ? { ...p, total: p.total + totalSettlement } : p
      );
      nextPlayersState = nextPlayersState.map(p => 
        currentLoserIds.includes(p.id) ? { ...p, debt: roundScores[p.id] } : p
      );
    } else {
      ruleType = lastWinner ? "Fresh Settlement" : "拉";
      logMessage = lastWinner ? `Full settlement to ${getPlayerName(lastWinner)} (No discount).` : ` `;
      
      let totalSettlement = 0;
      if (lastWinner) {
        nextPlayersState = nextPlayersState.map(p => {
          if (p.id !== lastWinner) {
            totalSettlement += p.debt;
            return { ...p, total: p.total - p.debt, debt: 0 };
          }
          return p;
        });
        nextPlayersState = nextPlayersState.map(p => 
          p.id === lastWinner ? { ...p, total: p.total + totalSettlement } : p
        );
      }
      nextPlayersState = nextPlayersState.map(p => 
        currentLoserIds.includes(p.id) ? { ...p, debt: roundScores[p.id] } : p
      );
    }

    setPlayers(nextPlayersState);
    setLastWinner(currentWinner);
    setHistory(prev => [{
      round: prev.length + 1,
      winner: currentWinner,
      type: ruleType,
      details: logMessage,
      scores: JSON.parse(JSON.stringify(nextPlayersState))
    }, ...prev]);

    setRoundScores({ P1: 0, P2: 0, P3: 0, P4: 0 });
    setCurrentWinner('');
  };

  const handleReset = () => {
    setPlayers(JSON.parse(JSON.stringify(INITIAL_PLAYERS)));
    setLastWinner(null);
    setHistory([]);
    setCurrentWinner('');
    setRoundScores({ P1: 0, P2: 0, P3: 0, P4: 0 });
    setShowResetConfirm(false);
    setShowSettingsMenu(false);
  };

  const handleResetKeepNames = () => {
    setPlayers(prev => prev.map((player, index) => ({
      ...INITIAL_PLAYERS[index],
      name: player.name,
    })));
    setLastWinner(null);
    setHistory([]);
    setCurrentWinner('');
    setRoundScores({ P1: 0, P2: 0, P3: 0, P4: 0 });
    setAdjValues({ P1: 0, P2: 0, P3: 0, P4: 0 });
    setAdjRemarks('');
    setShowAdjustments(false);
    setShowResetConfirm(false);
    setShowSettingsMenu(false);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const [, ...remainingHistory] = history;
    const restoredPlayers = remainingHistory[0]
      ? JSON.parse(JSON.stringify(remainingHistory[0].scores))
      : JSON.parse(JSON.stringify(INITIAL_PLAYERS));

    setPlayers(restoredPlayers);
    setHistory(remainingHistory);
    setLastWinner(getLastWinnerFromHistory(remainingHistory));
    setCurrentWinner('');
    setRoundScores({ P1: 0, P2: 0, P3: 0, P4: 0 });
    setAdjValues({ P1: 0, P2: 0, P3: 0, P4: 0 });
    setAdjRemarks('');
    setShowAdjustments(false);
    setShowResetConfirm(false);
    setShowSettingsMenu(false);
  };

  const toggleFullscreen = async () => {
    if (typeof document === 'undefined') return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  const adjSum = Object.values(adjValues).reduce((a, b) => a + b, 0);
  const visibleHistory = showFullHistory ? history : history.slice(0, 3);

  return (
        <div className="min-h-screen bg-[#f7f2e8] text-[#33281c] p-2 md:p-8 font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(203,162,84,0.16),_transparent_34%),radial-gradient(circle_at_18%_22%,_rgba(133,154,123,0.22),_transparent_28%),radial-gradient(circle_at_84%_10%,_rgba(160,104,88,0.12),_transparent_24%),linear-gradient(180deg,_rgba(249,243,232,0.94),_rgba(239,230,215,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.38)_0%,_transparent_18%,_transparent_82%,_rgba(184,152,105,0.08)_100%)]" />
      </div>
      <div className="max-w-5xl mx-auto space-y-2.5 md:space-y-7 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-2 md:gap-3">
          <div className="text-left">
            <h1 className="text-lg md:text-3xl font-semibold tracking-[0.18em] uppercase bg-gradient-to-r from-[#f5e6bf] via-[#d8b56f] to-[#8ea86d] bg-clip-text text-transparent leading-none drop-shadow-[0_0_16px_rgba(214,181,111,0.16)]">
              港式台灣牌
            </h1>
          </div>
          <div ref={settingsMenuRef} className="relative shrink-0">
            <button
              onClick={() => setShowSettingsMenu(prev => !prev)}
              className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 border backdrop-blur-md ${showSettingsMenu ? 'bg-[#fffaf1]/95 border-[#d8b56f]/55 text-[#7a5a23] shadow-[0_0_18px_rgba(216,181,111,0.16)]' : 'bg-[#fffaf1]/82 border-[#cbb89a]/60 text-[#6e5a43] hover:border-[#d8b56f]/45 hover:text-[#7a5a23]'}`}
              aria-label="Open settings"
            >
              <Settings2 size={18} />
            </button>
            {showSettingsMenu && (
              <div className="settings-popover absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#d8c3a2]/70 bg-[linear-gradient(180deg,rgba(255,251,244,0.96),rgba(245,237,225,0.98))] shadow-[0_24px_60px_rgba(100,76,45,0.18)] backdrop-blur-xl p-2 z-20 space-y-2">
                <button 
                  onClick={() => setIsEditingNames(!isEditingNames)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 border text-xs md:text-sm ${isEditingNames ? 'bg-[#f5ebd6] border-[#d8b56f]/45 text-[#7a5a23] shadow-[0_0_16px_rgba(216,181,111,0.14)]' : 'bg-[#fffaf1]/88 border-[#d9c8aa]/70 text-[#6e5a43] hover:border-[#d8b56f]/35 hover:text-[#7a5a23]'}`}
                >
                  <UserCircle size={18} /> {isEditingNames ? '確定' : '改名'}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 border text-xs md:text-sm bg-[#fffaf1]/88 border-[#d9c8aa]/70 text-[#6e5a43] hover:border-[#d8b56f]/35 hover:text-[#7a5a23]"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  {isFullscreen ? 'Exit Full' : 'Fullscreen'}
                </button>
                <button 
                  onClick={() => setShowAdjustments(!showAdjustments)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 border text-xs md:text-sm ${showAdjustments ? 'bg-[#f5ebd6] border-[#d8b56f]/45 text-[#9b6c20] shadow-[0_0_16px_rgba(216,181,111,0.14)]' : 'bg-[#fffaf1]/88 border-[#d9c8aa]/70 text-[#6e5a43] hover:border-[#d8b56f]/35 hover:text-[#7a5a23]'}`}
                >
                  <Settings2 size={18} /> 花/槓/骰
                </button>
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 border text-xs md:text-sm bg-[#fffaf1]/88 border-[#d9c8aa]/70 text-[#6e5a43] hover:border-[#d8b56f]/35 hover:text-[#7a5a23] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Undo2 size={18} /> Undo
                </button>
                
                {showResetConfirm ? (
                  <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={handleResetKeepNames}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[linear-gradient(135deg,#b78a45,#e0ba70)] text-[#08110d] rounded-lg font-bold border border-[#efd89b]/60 shadow-[0_12px_28px_rgba(183,138,69,0.28)] text-xs md:text-sm"
                    >
                      <RotateCcw size={16} /> Reset Stats Keep Names
                    </button>
                    <div className="flex gap-1">
                      <button 
                        onClick={handleReset}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[linear-gradient(135deg,#6f1f27,#a63a46)] text-white rounded-l-lg font-bold border border-[#c36c74]/40 shadow-[0_12px_24px_rgba(111,31,39,0.28)] text-xs md:text-sm"
                      >
                        Full Reset
                      </button>
                      <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-2 bg-[#fffaf1]/88 text-[#7a6854] rounded-r-lg border border-[#d9c8aa]/70"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[#fffaf1]/88 hover:border-[#c36c74]/35 hover:bg-[#f3e3e2] text-[#9e5b63] rounded-lg transition-all duration-300 border border-[#d9c8aa]/70 text-xs md:text-sm"
                  >
                    <RotateCcw size={18} /> Reset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Manual Adjustments Panel */}
        {showAdjustments && (
          <div className="bg-[linear-gradient(180deg,rgba(255,251,244,0.96),rgba(245,237,225,0.98))] border border-[#d8c3a2]/70 rounded-2xl p-3 md:p-6 animate-in slide-in-from-top duration-300 shadow-[0_24px_60px_rgba(100,76,45,0.14)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 mb-4 md:mb-6 md:flex-row md:justify-between md:items-center">
              <h2 className="text-lg md:text-xl font-semibold text-[#9b6c20] flex items-center gap-2">
                <Settings2 size={20} /> 花/槓/骰
              </h2>
              <div className={`px-3 py-1 rounded-full text-[11px] font-bold border self-start md:self-auto ${adjSum === 0 ? 'bg-[#edf4e8] border-[#9eb48e]/55 text-[#58724c]' : 'bg-[#f5e3e4] border-[#c79297]/45 text-[#a45c64]'}`}>
                Balance: {adjSum > 0 ? `+${adjSum}` : adjSum} {adjSum === 0 ? '(Perfectly Balanced)' : '(Not Zero-Sum)'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 mb-3 md:mb-6">
              {players.map(p => (
                <div key={p.id} className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8b7356] uppercase">{p.name}</label>
                  <input 
                    type="number"
                    value={adjValues[p.id] || ''}
                    onChange={(e) => handleAdjChange(p.id, e.target.value)}
                    className="w-full bg-[#fffaf4] border border-[#d8c3a2]/70 rounded-lg p-2 md:p-3 text-[#9b6c20] font-mono focus:ring-2 focus:ring-[#d8b56f]/45 outline-none"
                    placeholder="+/- 番"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-3 md:mb-6">
              <label className="text-xs font-bold text-[#8b7356] uppercase flex items-center gap-1">
                <MessageSquare size={12} /> 原因
              </label>
              <input 
                type="text"
                value={adjRemarks}
                onChange={(e) => setAdjRemarks(e.target.value)}
                className="w-full bg-[#fffaf4] border border-[#d8c3a2]/70 rounded-lg p-2 md:p-3 text-[#4a3a29] outline-none focus:ring-2 focus:ring-[#d8b56f]/45"
                placeholder="e.g. 暗槓 / 圍骰"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdjustments(false)} className="px-4 py-2 text-[#8b7356] hover:text-[#7a5a23] transition-colors">取消</button>
              <button 
                onClick={applyAdjustments}
                className="px-6 py-2 bg-[linear-gradient(135deg,#b78a45,#e0ba70)] hover:brightness-105 text-[#08110d] rounded-lg font-bold shadow-[0_16px_32px_rgba(183,138,69,0.22)] flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> 確定
              </button>
            </div>
          </div>
        )}

        {/* Player Dashboards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {players.map((p) => (
            <div key={p.id} className={`p-2.5 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-500 backdrop-blur-xl ${lastWinner === p.id ? 'bg-[linear-gradient(180deg,rgba(238,245,234,0.98),rgba(225,236,219,0.98))] border-[#c7a95f]/45 shadow-[0_16px_40px_rgba(199,169,95,0.12)]' : leaderId === p.id ? 'bg-[linear-gradient(180deg,rgba(244,240,223,0.96),rgba(236,229,205,0.98))] border-[#b6bc86]/45 shadow-[0_14px_34px_rgba(182,188,134,0.12)]' : dangerId === p.id ? 'bg-[linear-gradient(180deg,rgba(249,234,232,0.96),rgba(243,223,220,0.98))] border-[#d2a2a8]/45 shadow-[0_14px_34px_rgba(187,106,116,0.10)]' : 'bg-[linear-gradient(180deg,rgba(255,251,244,0.96),rgba(245,237,225,0.98))] border-[#d8c3a2]/65 shadow-[0_14px_34px_rgba(122,94,58,0.10)]'}`}>
              <div className="flex justify-end mb-1 md:mb-4 h-4">
                {lastWinner === p.id && <Flame className="text-[#f3b35b] animate-pulse drop-shadow-[0_0_10px_rgba(243,179,91,0.45)]" size={14} />}
              </div>
              
              {isEditingNames ? (
                <input 
                  autoFocus
                  className="bg-[#fffaf4] border border-[#d8c3a2]/70 rounded px-2 py-1 text-sm md:text-xl font-bold w-full text-[#33281c] outline-none focus:ring-2 focus:ring-[#d8b56f]/40"
                  value={p.name}
                  onChange={(e) => handleNameUpdate(p.id, e.target.value)}
                />
              ) : (
                <h3 className="text-sm md:text-xl font-semibold tracking-[0.03em] mb-0.5 truncate text-[#33281c]">{p.name}</h3>
              )}

              <div className="space-y-1.5 md:space-y-3 mt-1 md:mt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8b7356] font-semibold mb-1">總數</p>
                  <p className={`text-base md:text-2xl font-mono leading-none ${lastWinner === p.id ? 'text-[#9b6c20]' : p.total >= 0 ? 'text-[#58724c]' : 'text-[#a45c64]'}`}>
                    {p.total.toFixed(0)}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#e2d3bc]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8b7356] font-semibold mb-1">拉</p>
                  <p className={`text-sm md:text-xl font-mono leading-none ${p.id === dangerId ? 'text-[#b86f40]' : p.debt > 0 ? 'text-[#9b6c20]' : 'text-[#b9a892]'}`}>
                    {p.debt > 0 ? `-${p.debt.toFixed(0)}` : '0'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Round Input Card */}
        <div className="bg-[linear-gradient(180deg,rgba(255,251,244,0.96),rgba(245,237,225,0.98))] border border-[#d8c3a2]/70 rounded-xl md:rounded-2xl p-2.5 md:p-6 shadow-[0_24px_60px_rgba(100,76,45,0.14)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2.5 md:mb-6">
            <Swords className="text-[#d8b56f]" />
            <h2 className="text-lg md:text-xl font-bold text-[#33281c]">食糊</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-8">
            <div className="space-y-1.5">
              <label className="block text-[11px] md:text-sm font-medium uppercase tracking-[0.18em] text-[#8b7356]">贏家</label>
              <div className="grid grid-cols-2 gap-1.5">
                {players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentWinner(p.id)}
                    className={`py-1.5 md:py-3 px-2.5 md:px-4 rounded-lg md:rounded-xl border transition-all duration-300 flex items-center justify-center gap-1.5 font-bold text-xs md:text-base ${currentWinner === p.id ? 'bg-[linear-gradient(135deg,#b78a45,#e0ba70)] border-[#efd89b]/55 text-[#08110d] shadow-[0_16px_32px_rgba(183,138,69,0.18)]' : 'bg-[#fffaf1]/88 border-[#d9c8aa]/70 text-[#6e5a43] hover:border-[#d8b56f]/35 hover:text-[#7a5a23]'}`}
                  >
                    {currentWinner === p.id && <Trophy size={14} />}
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] md:text-sm font-medium uppercase tracking-[0.18em] text-[#8b7356]">番數</label>
              <div className="grid grid-cols-2 gap-2">
                {players.map(p => (
                  <div key={p.id} className={`space-y-1 ${currentWinner === p.id ? 'opacity-30' : ''}`}>
                    <span className="block text-[11px] md:text-sm font-semibold truncate">{p.name}</span>
                    <input 
                      type="number"
                      disabled={currentWinner === p.id}
                      value={roundScores[p.id] || ''}
                      onChange={(e) => handleScoreChange(p.id, e.target.value)}
                      className="bg-[#fffaf4] border border-[#d8c3a2]/70 rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#d8b56f]/38 text-[#58724c] font-mono text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2.5 md:mt-8 flex justify-end">
            <button
              disabled={!currentWinner}
              onClick={processRound}
              className="w-full md:w-auto px-6 py-2 md:px-8 md:py-3 bg-[linear-gradient(135deg,#b78a45,#e0ba70)] hover:brightness-105 disabled:bg-stone-700 disabled:cursor-not-allowed text-[#08110d] font-bold rounded-lg md:rounded-xl transition-all duration-300 shadow-[0_16px_32px_rgba(183,138,69,0.26)] flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <RotateCw size={18} /> 確定更新
            </button>
          </div>
        </div>

        {/* History Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="text-[#b78a45]" />
              <h2 className="text-lg md:text-xl font-semibold text-[#33281c] tracking-[0.08em]">記錄</h2>
            </div>
            {history.length > 3 && (
              <button
                onClick={() => setShowFullHistory(prev => !prev)}
                className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-[#d9c8aa]/70 bg-[#fffaf1]/88 text-[#6e5a43] hover:border-[#d8b56f]/35 hover:text-[#7a5a23] transition-all duration-300"
              >
                {showFullHistory ? 'Show Less' : `Show All (${history.length})`}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {history.length === 0 && (
              <div className="p-6 text-center bg-[linear-gradient(180deg,rgba(255,251,244,0.82),rgba(245,237,225,0.92))] rounded-xl border border-dashed border-[#d9c8aa]/70 text-[#8b7356] italic">No rounds recorded.</div>
            )}
            {visibleHistory.map((h, i) => (
              <div key={i} className="bg-[linear-gradient(180deg,rgba(255,251,244,0.96),rgba(245,237,225,0.98))] border border-[#d8c3a2]/70 p-3.5 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 shadow-[0_14px_34px_rgba(100,76,45,0.12)]">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#fff6e8] flex items-center justify-center font-bold text-[#b78a45] border border-[#d9c8aa]/70 shrink-0">
                    {h.round}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-base md:text-lg ${h.winner === 'SYSTEM' ? 'text-[#9b6c20]' : 'text-[#58724c]'}`}>
                        {h.winner === 'SYSTEM' ? 'ADJUSTMENT' : `${getPlayerName(h.winner)} 勝出`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.18em] border ${h.type === 'Adjustment' ? 'bg-[#f5ebd6] text-[#9b6c20] border-[#d8b56f]/35' : 'bg-[#edf4e8] text-[#58724c] border-[#9eb48e]/40'}`}>
                        {h.type}
                      </span>
                    </div>
                    <p className={`text-sm ${h.winner === 'SYSTEM' ? 'text-[#9b7e58]/80 italic' : 'text-[#8b7356]'}`}>
                      {h.winner === 'SYSTEM' && <MessageSquare size={12} className="inline mr-1 mb-0.5" />}
                      {h.details}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 bg-[#fff8ee]/90 p-3 rounded-lg border border-[#e2d3bc]">
                  {h.scores.map(s => (
                    <div key={s.id} className="flex flex-col items-center min-w-[60px]">
                      <span className="text-[10px] text-[#8b7356] font-bold mb-1 truncate max-w-[60px]">{getPlayerName(s.id)}</span>
                      <span className={`text-sm font-mono font-bold ${s.total >= 0 ? 'text-[#58724c]' : 'text-[#a45c64]'}`}>
                        {s.total > 0 ? `+${s.total.toFixed(1)}` : s.total.toFixed(1)}
                      </span>
                      <span className="text-[9px] text-[#9b6c20]/80">
                        {s.debt > 0 ? `拉: -${s.debt.toFixed(1)}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <details className="bg-[linear-gradient(180deg,rgba(255,251,244,0.86),rgba(245,237,225,0.94))] border border-[#d8c3a2]/70 rounded-xl p-3.5 md:p-6 text-xs text-[#8b7356] backdrop-blur-xl">
           <summary className="flex items-center gap-2 text-[#33281c] font-semibold uppercase tracking-[0.18em] text-[10px] cursor-pointer select-none">
             <Info size={14} className="text-[#d8b56f]" /> Rules Reference
           </summary>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mt-3.5">
             <p><strong>Streak (A):</strong> Same winner = Loser Debt × 1.5 + Round Loss. Banked totals stay the same until streak ends.</p>
             <p><strong>Slayer (B):</strong> Defeating the king = Winner pays 50% debt <b>ONLY IF</b> the king lost this specific round. Others pay 100%.</p>
             <p><strong>Adjustment:</strong> Modifies Banked Total only. Current Tab/Debt is preserved for the next settlement.</p>
           </div>
        </details>

      </div>
    </div>
  );
};

export default App;
