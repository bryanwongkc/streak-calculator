import React from 'react';
import { formatSignedNumber } from '../../utils/formatting';

export const StatsTable = ({ rankings }) => (
  <div className="rounded-xl border border-[#d1d5db]/80 bg-white/90">
    <div className="divide-y divide-[#e5e7eb] md:hidden">
      {rankings.map((stat, index) => (
        <div key={stat.id} className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2 p-3 text-sm">
          <div className="font-mono text-[#6b7280]">{index + 1}</div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#111827]">{stat.name}</p>
            <p className="text-xs text-[#6b7280]">{stat.wins}W / {stat.losses}L / debt {stat.debt || 0}</p>
          </div>
          <div className={`font-mono font-bold ${stat.total >= 0 ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
            {formatSignedNumber(stat.total)}
          </div>
        </div>
      ))}
    </div>
    <div className="hidden md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f3f4f6] text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
          <tr>
            <th className="px-3 py-3">Rank</th>
            <th className="px-3 py-3">Player</th>
            <th className="px-3 py-3">Total</th>
            <th className="px-3 py-3">Debt</th>
            <th className="px-3 py-3">Wins</th>
            <th className="px-3 py-3">Losses</th>
            <th className="px-3 py-3">Biggest win</th>
            <th className="px-3 py-3">Biggest loss</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {rankings.map((stat, index) => (
            <tr key={stat.id}>
              <td className="px-3 py-3 font-mono text-[#6b7280]">{index + 1}</td>
              <td className="px-3 py-3 font-semibold text-[#111827]">{stat.name}</td>
              <td className={`px-3 py-3 font-mono font-bold ${stat.total >= 0 ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
                {formatSignedNumber(stat.total)}
              </td>
              <td className="px-3 py-3 font-mono">{stat.debt ? `-${stat.debt}` : '0'}</td>
              <td className="px-3 py-3 font-mono">{stat.wins}</td>
              <td className="px-3 py-3 font-mono">{stat.losses}</td>
              <td className="px-3 py-3 font-mono">{stat.biggestWin ? `${formatSignedNumber(stat.biggestWin.value)} (R${stat.biggestWin.round})` : '-'}</td>
              <td className="px-3 py-3 font-mono text-[#6b7280]">{stat.biggestLoss ? `${formatSignedNumber(stat.biggestLoss.value)} (R${stat.biggestLoss.round})` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
