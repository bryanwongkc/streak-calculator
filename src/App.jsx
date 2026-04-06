import React, { useState } from 'react';
import { Trophy, Swords, Flame, RotateCcw, History, RotateCw, Info, Settings2, CheckCircle2, MessageSquare, UserCircle, XCircle, Undo2 } from 'lucide-react';

const INITIAL_PLAYERS = [
  { id: 'P1', name: 'Player 1', total: 0, debt: 0 },
  { id: 'P2', name: 'Player 2', total: 0, debt: 0 },
  { id: 'P3', name: 'Player 3', total: 0, debt: 0 },
  { id: 'P4', name: 'Player 4', total: 0, debt: 0 },
];

const App = () => {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [lastWinner, setLastWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  
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
      ruleType = "Streak (1.5x)";
      logMessage = `${getPlayerName(currentWinner)} continues the streak! Loser debts multiplied by 1.5.`;
      nextPlayersState = nextPlayersState.map(p => {
        if (currentLoserIds.includes(p.id)) {
          return { ...p, debt: (p.debt * 1.5) + roundScores[p.id] };
        }
        return p;
      });
    } else if (isSlayingKing) {
      ruleType = "Giant Slayer (50% Off)";
      logMessage = `${getPlayerName(currentWinner)} unseated ${getPlayerName(lastWinner)}! ${getPlayerName(currentWinner)} pays 50% debt because ${getPlayerName(lastWinner)} lost.`;
      
      let totalSettlement = 0;
      nextPlayersState = nextPlayersState.map(p => {
        if (p.id === currentWinner) {
          const payment = p.debt * 0.5;
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
      ruleType = lastWinner ? "Fresh Settlement" : "Initial Round";
      logMessage = lastWinner ? `Full settlement to ${getPlayerName(lastWinner)} (No discount).` : `First round started.`;
      
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
  };

  const adjSum = Object.values(adjValues).reduce((a, b) => a + b, 0);
  const visibleHistory = showFullHistory ? history : history.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              港式台灣牌
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full md:flex md:flex-wrap md:justify-center md:w-auto">
            <button 
              onClick={() => setIsEditingNames(!isEditingNames)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all border text-xs md:text-sm ${isEditingNames ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
            >
              <UserCircle size={18} /> {isEditingNames ? 'Lock Names' : 'Edit Names'}
            </button>
            <button 
              onClick={() => setShowAdjustments(!showAdjustments)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all border text-xs md:text-sm ${showAdjustments ? 'bg-amber-900/20 border-amber-500/50 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
            >
              <Settings2 size={18} /> Adjust Totals
            </button>
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all border text-xs md:text-sm bg-slate-800 border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Undo2 size={18} /> Undo
            </button>
            
            {showResetConfirm ? (
              <div className="col-span-2 flex gap-1 animate-in fade-in zoom-in duration-200 md:col-span-1">
                <button 
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-rose-600 text-white rounded-l-lg font-bold border border-rose-500 shadow-lg shadow-rose-900/20 text-xs md:text-sm"
                >
                  Confirm Reset
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-400 rounded-r-lg border border-slate-700"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-lg transition-all border border-slate-700 text-xs md:text-sm"
              >
                <RotateCcw size={18} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Manual Adjustments Panel */}
        {showAdjustments && (
          <div className="bg-amber-950/10 border-2 border-amber-900/30 rounded-2xl p-4 md:p-6 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-3 mb-4 md:mb-6 md:flex-row md:justify-between md:items-center">
              <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
                <Settings2 size={20} /> Manual Bank Adjustments
              </h2>
              <div className={`px-3 py-1 rounded-full text-[11px] font-bold border self-start md:self-auto ${adjSum === 0 ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-900/20 border-rose-500/50 text-rose-400'}`}>
                Balance: {adjSum > 0 ? `+${adjSum}` : adjSum} {adjSum === 0 ? '(Perfectly Balanced)' : '(Not Zero-Sum)'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              {players.map(p => (
                <div key={p.id} className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{p.name}</label>
                  <input 
                    type="number"
                    value={adjValues[p.id] || ''}
                    onChange={(e) => handleAdjChange(p.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 md:p-3 text-amber-400 font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="+/- Points"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4 md:mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <MessageSquare size={12} /> Special Remarks (Shown in History)
              </label>
              <input 
                type="text"
                value={adjRemarks}
                onChange={(e) => setAdjRemarks(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 md:p-3 text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Correcting error from round 5..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdjustments(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={applyAdjustments}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-lg shadow-amber-900/20 flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> Apply Changes
              </button>
            </div>
          </div>
        )}

        {/* Player Dashboards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {players.map((p) => (
            <div key={p.id} className={`p-3 md:p-5 rounded-2xl border-2 transition-all duration-500 ${lastWinner === p.id ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex justify-end mb-3 md:mb-4">
                {lastWinner === p.id && <Flame className="text-orange-500 animate-pulse" size={18} />}
              </div>
              
              {isEditingNames ? (
                <input 
                  autoFocus
                  className="bg-slate-800 border border-blue-500/50 rounded px-2 py-1 text-base md:text-xl font-bold w-full text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={p.name}
                  onChange={(e) => handleNameUpdate(p.id, e.target.value)}
                />
              ) : (
                <h3 className="text-base md:text-xl font-bold mb-1 truncate">{p.name}</h3>
              )}

              <div className="space-y-2 md:space-y-3 mt-3 md:mt-4">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Banked Total</p>
                  <p className={`text-xl md:text-2xl font-mono ${p.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.total.toFixed(1)}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Current Tab (Debt)</p>
                  <p className={`text-base md:text-xl font-mono ${p.debt > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                    {p.debt > 0 ? `-${p.debt.toFixed(1)}` : '0.0'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Round Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Swords className="text-blue-400" />
            <h2 className="text-lg md:text-xl font-bold text-white">Record New Round</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-400">Who won this round?</label>
              <div className="grid grid-cols-2 gap-2">
                {players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentWinner(p.id)}
                    className={`py-2.5 md:py-3 px-3 md:px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-sm md:text-base ${currentWinner === p.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'}`}
                  >
                    {currentWinner === p.id && <Trophy size={16} />}
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-400">Base points lost (for others)</label>
              <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                {players.map(p => (
                  <div key={p.id} className={`flex items-center gap-3 ${currentWinner === p.id ? 'opacity-30' : ''}`}>
                    <span className="w-20 md:w-24 text-sm font-semibold truncate">{p.name}:</span>
                    <input 
                      type="number"
                      disabled={currentWinner === p.id}
                      value={roundScores[p.id] || ''}
                      onChange={(e) => handleScoreChange(p.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-emerald-400 font-mono"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 md:mt-8 flex justify-end">
            <button
              disabled={!currentWinner}
              onClick={processRound}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <RotateCw size={18} /> Update & Settle
            </button>
          </div>
        </div>

        {/* History Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="text-slate-500" />
              <h2 className="text-lg md:text-xl font-bold text-slate-300">Match History</h2>
            </div>
            {history.length > 3 && (
              <button
                onClick={() => setShowFullHistory(prev => !prev)}
                className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300"
              >
                {showFullHistory ? 'Show Less' : `Show All (${history.length})`}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {history.length === 0 && (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-slate-500 italic">No rounds recorded.</div>
            )}
            {visibleHistory.map((h, i) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800 p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700 shrink-0">
                    {h.round}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-base md:text-lg ${h.winner === 'SYSTEM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {h.winner === 'SYSTEM' ? 'ADJUSTMENT' : `${getPlayerName(h.winner)} Won`}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight border ${h.type === 'Adjustment' ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 'bg-blue-900/30 text-blue-400 border-blue-800/50'}`}>
                        {h.type}
                      </span>
                    </div>
                    <p className={`text-sm ${h.winner === 'SYSTEM' ? 'text-amber-200/70 italic' : 'text-slate-500'}`}>
                      {h.winner === 'SYSTEM' && <MessageSquare size={12} className="inline mr-1 mb-0.5" />}
                      {h.details}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-8 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                  {h.scores.map(s => (
                    <div key={s.id} className="flex flex-col items-center min-w-[60px]">
                      <span className="text-[10px] text-slate-500 font-bold mb-1 truncate max-w-[60px]">{getPlayerName(s.id)}</span>
                      <span className={`text-sm font-mono font-bold ${s.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.total > 0 ? `+${s.total.toFixed(1)}` : s.total.toFixed(1)}
                      </span>
                      <span className="text-[9px] text-amber-500/70">
                        {s.debt > 0 ? `Tab: -${s.debt.toFixed(1)}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <details className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 md:p-6 text-xs text-slate-400">
           <summary className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-widest text-[10px] cursor-pointer select-none">
             <Info size={14} className="text-blue-400" /> Rules Reference
           </summary>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4">
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
