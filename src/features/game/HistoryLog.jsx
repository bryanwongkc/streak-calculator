import React, { useRef, useState } from 'react';
import { History, MessageSquare } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatSignedNumber } from '../../utils/formatting';

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
    entry.winner === 'SYSTEM' ? '其他' : `${getPlayerName(entry.winner)} 贏`
  );
  const getEntryDetails = (entry) => {
    if (entry.winner === 'SYSTEM') return entry.details;
    if (entry.type === 'Slaying king') return `${getPlayerName(entry.winner)} 劈半`;
    if (entry.details === 'Opening winning hand.') return '贏頭糊';
    if (entry.details?.includes('repeats the win')) return `${getPlayerName(entry.winner)} 再拉`;

    const settlementMatch = entry.details?.match(/^Full settlement to (.+)\.$/);
    if (settlementMatch) return `${settlementMatch[1]} 收錢`;

    return entry.details;
  };

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
          {visibleHistory.map((entry, index) => (
            <div
              key={entry.id || `${entry.round}-${index}`}
              className="flex flex-col justify-between gap-2 rounded-xl border border-[#d1d5db]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,244,246,0.98))] p-2.5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] md:flex-row md:items-center md:gap-6 md:p-5"
            >
              <div className="flex min-w-0 items-center gap-2.5 md:gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d1d5db]/80 bg-[#f3f4f6] text-sm font-bold text-[#4b5563] md:h-10 md:w-10">
                  {entry.round}
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold leading-tight text-[#111827] md:text-lg">
                      {getEntryTitle(entry)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b7280] md:text-sm">
                    {entry.winner === 'SYSTEM' ? <MessageSquare size={12} className="mb-0.5 mr-1 inline" /> : null}
                    {getEntryDetails(entry)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#e5e7eb] bg-[#f8fafc]/90 p-2 sm:grid-cols-4 md:gap-5 md:p-3">
                {(entry.scores || entry.afterScores || []).map((score) => (
                  <div key={score.id} className="flex min-w-[60px] flex-col items-center">
                    <span className="mb-0.5 max-w-[70px] truncate text-[10px] font-bold text-[#6b7280]">{getPlayerName(score.id)}</span>
                    <span className="font-mono text-sm font-bold text-[#374151]">
                      {formatSignedNumber(score.total, 1)}
                    </span>
                    <span className="text-[9px] text-[#6b7280]/80">
                      {score.debt > 0 ? `被拉: -${score.debt.toFixed(1)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
