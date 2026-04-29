import React, { useState } from 'react';
import { History, MessageSquare } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatSignedNumber } from '../../utils/formatting';

export const HistoryLog = ({ history, players }) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const visibleHistory = showFullHistory ? history : history.slice(0, 3);
  const getPlayerName = (id) => players.find((player) => player.id === id)?.name || id;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="text-[#6b7280]" />
          <h2 className="text-lg font-semibold tracking-[0.08em] text-[#1f2937] md:text-xl">History</h2>
        </div>
        {history.length > 3 ? (
          <Button size="sm" onClick={() => setShowFullHistory((value) => !value)}>
            {showFullHistory ? 'Show less' : `Show all (${history.length})`}
          </Button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <EmptyState title="No rounds recorded." description="Confirm a winning hand or add a manual adjustment to start the log." />
      ) : (
        <div className="space-y-3">
          {visibleHistory.map((entry, index) => (
            <div
              key={entry.id || `${entry.round}-${index}`}
              className="flex flex-col justify-between gap-3 rounded-xl border border-[#d1d5db]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,244,246,0.98))] p-3.5 shadow-[0_14px_34px_rgba(148,163,184,0.12)] md:flex-row md:items-center md:gap-6 md:p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d1d5db]/80 bg-[#f3f4f6] font-bold text-[#4b5563] md:h-10 md:w-10">
                  {entry.round}
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#111827] md:text-lg">
                      {entry.winner === 'SYSTEM' ? 'Adjustment' : `${getPlayerName(entry.winner)} won`}
                    </span>
                    <span className="rounded-full border border-[#cbd5e1]/70 bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4b5563]">
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7280]">
                    {entry.winner === 'SYSTEM' ? <MessageSquare size={12} className="mb-0.5 mr-1 inline" /> : null}
                    {entry.details}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafc]/90 p-3 sm:grid-cols-4 md:gap-5">
                {(entry.scores || entry.afterScores || []).map((score) => (
                  <div key={score.id} className="flex min-w-[60px] flex-col items-center">
                    <span className="mb-1 max-w-[70px] truncate text-[10px] font-bold text-[#6b7280]">{getPlayerName(score.id)}</span>
                    <span className="font-mono text-sm font-bold text-[#374151]">
                      {formatSignedNumber(score.total, 1)}
                    </span>
                    <span className="text-[9px] text-[#6b7280]/80">
                      {score.debt > 0 ? `debt: -${score.debt.toFixed(1)}` : ''}
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
