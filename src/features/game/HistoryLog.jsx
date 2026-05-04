import React, { useRef, useState } from 'react';
import { History, MessageSquare } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatSignedNumber } from '../../utils/formatting';
import { getActiveDebtPockets } from './gameEngine';

const getScoreSnapshot = (entry) => entry.scores || entry.afterScores || [];

const getLegacyWinEvents = (entry) => {
  if (entry.winEvents?.length) return entry.winEvents;
  if (!entry.winner || entry.winner === 'SYSTEM') return [];

  const loserIds = entry.loserIds || Object.keys(entry.roundScores || {}).filter((id) => Number(entry.roundScores[id]) > 0);
  return loserIds.map((loserId) => ({
    winnerId: entry.winner,
    loserId,
    amount: Number(entry.roundScores?.[loserId] || 0),
  })).filter((event) => event.amount > 0);
};

export const HistoryLog = ({ history, players }) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const sectionRef = useRef(null);
  const visibleHistory = showFullHistory ? history : history.slice(0, 3);
  const toggleHistory = () => {
    setShowFullHistory((expanded) => {
      const nextExpanded = !expanded;
      if (expanded) {
        window.setTimeout(() => {
          sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }, 0);
      }
      return nextExpanded;
    });
  };
  const getPlayerName = (id) => players.find((player) => player.id === id)?.name || id;
  const getEntryTitle = (entry) => (
    entry.winner === 'SYSTEM' ? '其他' : `Round ${entry.round}`
  );
  return (
    <section ref={sectionRef} className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="text-[#6b7280]" />
          <h2 className="text-base font-semibold tracking-[0.08em] text-[#1f2937] md:text-xl">紀錄</h2>
        </div>
        {history.length > 3 ? (
          <Button size="sm" onClick={toggleHistory}>
            {showFullHistory ? 'Show less' : `Show all (${history.length})`}
          </Button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <EmptyState title="No rounds recorded." description="Confirm a winning hand or add a manual adjustment to start the log." />
      ) : (
        <div className="space-y-2.5">
          {visibleHistory.map((entry, index) => {
            const winEvents = getLegacyWinEvents(entry);
            const debtPockets = entry.activeDebtPocketsAfter || getActiveDebtPockets(getScoreSnapshot(entry));

            return (
              <div
                key={entry.id || `${entry.round}-${index}`}
                className="flex flex-col justify-between gap-2 rounded-xl border border-[#d1d5db]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,244,246,0.98))] p-2.5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] md:flex-row md:items-start md:gap-6 md:p-5"
              >
                <div className="flex min-w-0 items-start gap-2.5 md:gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d1d5db]/80 bg-[#f3f4f6] text-sm font-bold text-[#4b5563] md:h-10 md:w-10">
                    {entry.round}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold leading-tight text-[#111827] md:text-lg">
                        {getEntryTitle(entry)}
                      </span>
                    </div>
                    {entry.winner === 'SYSTEM' ? (
                      <p className="text-xs text-[#6b7280] md:text-sm">
                        <MessageSquare size={12} className="mb-0.5 mr-1 inline" />
                        {entry.details}
                      </p>
                    ) : null}

                    {winEvents.length || (entry.winner !== 'SYSTEM' && debtPockets.length) ? (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#374151] md:gap-3 md:text-sm">
                        {winEvents.length ? (
                          <div className="min-w-0 space-y-1">
                            <p className="font-semibold text-[#6b7280]">即局</p>
                            {winEvents.map((event, eventIndex) => (
                              <p key={`${event.winnerId}-${event.loserId}-${eventIndex}`}>
                                {getPlayerName(event.winnerId)} 食 {getPlayerName(event.loserId)}: <span className="font-mono font-bold">{Number(event.amount || 0).toFixed(0)}</span>
                              </p>
                            ))}
                          </div>
                        ) : null}

                        {entry.winner !== 'SYSTEM' && debtPockets.length ? (
                          <div className="min-w-0 space-y-1">
                            <p className="font-semibold text-[#6b7280]">拉 總數</p>
                            {debtPockets.map((pocket) => (
                              <p key={`${entry.id}-${pocket.debtorId}-${pocket.ownerId}`}>
                                {getPlayerName(pocket.ownerId)} 拉 {getPlayerName(pocket.debtorId)}: <span className="font-mono font-bold">{Number(pocket.amount || 0).toFixed(0)}</span>
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#e5e7eb] bg-[#f8fafc]/90 p-2 sm:grid-cols-4 md:gap-5 md:p-3">
                  {getScoreSnapshot(entry).map((score) => (
                    <div key={score.id} className="flex min-w-[60px] flex-col items-center">
                      <span className="mb-0.5 max-w-[70px] truncate text-[10px] font-bold text-[#6b7280]">{getPlayerName(score.id)}</span>
                      <span className="font-mono text-sm font-bold text-[#374151]">
                        {formatSignedNumber(score.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
