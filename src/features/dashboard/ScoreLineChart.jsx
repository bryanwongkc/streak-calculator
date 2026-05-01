import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { formatSignedNumber } from '../../utils/formatting';

const PLAYER_COLORS = ['#111827', '#2563eb', '#dc2626', '#16a34a', '#7c3aed', '#ca8a04'];

const clampRange = (values) => {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  if (min === max) return { min: min - 1, max: max + 1 };
  const padding = Math.max((max - min) * 0.12, 5);
  return { min: min - padding, max: max + padding };
};

export const ScoreLineChart = ({ players = [], timeline = [] }) => {
  const points = timeline.length ? timeline : [{ round: 0, label: 'Start', totalsByPlayer: {} }];
  const values = points.flatMap((point) => players.map((player) => Number(point.totalsByPlayer?.[player.id] || 0)));
  const { min, max } = clampRange(values);
  const width = 320;
  const height = 172;
  const chart = { left: 30, right: 300, top: 18, bottom: 124 };
  const xFor = (index) => {
    if (points.length === 1) return (chart.left + chart.right) / 2;
    return chart.left + ((chart.right - chart.left) * index) / (points.length - 1);
  };
  const yFor = (value) => chart.bottom - ((Number(value || 0) - min) / (max - min)) * (chart.bottom - chart.top);
  const zeroY = yFor(0);

  return (
    <Card className="overflow-hidden p-2.5 md:p-4">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <TrendingUp size={16} className="shrink-0 text-[#6b7280]" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#111827] md:text-base">Total score</h2>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">{points.length - 1} updates</p>
          </div>
        </div>
        <p className="shrink-0 font-mono text-xs font-semibold text-[#6b7280]">
          {points.at(-1)?.label || 'Start'}
        </p>
      </div>

      <svg className="block h-44 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Total score line chart">
        <defs>
          <linearGradient id="scoreChartFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#eef2f7" stopOpacity="0.86" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx="12" fill="url(#scoreChartFade)" />
        {[0, 0.5, 1].map((step) => {
          const y = chart.top + (chart.bottom - chart.top) * step;
          return <line key={step} x1={chart.left} x2={chart.right} y1={y} y2={y} stroke="#d1d5db" strokeDasharray="3 5" strokeWidth="1" />;
        })}
        <line x1={chart.left} x2={chart.right} y1={zeroY} y2={zeroY} stroke="#9ca3af" strokeWidth="1.2" />
        <text x="8" y={chart.top + 4} className="fill-[#6b7280] font-mono text-[9px]">{formatSignedNumber(max)}</text>
        <text x="8" y={chart.bottom + 3} className="fill-[#6b7280] font-mono text-[9px]">{formatSignedNumber(min)}</text>

        {players.map((player, playerIndex) => {
          const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
          const linePoints = points.map((point, pointIndex) => `${xFor(pointIndex)},${yFor(point.totalsByPlayer?.[player.id])}`).join(' ');
          const latestPoint = points.at(-1);
          return (
            <g key={player.id}>
              <polyline
                fill="none"
                points={linePoints}
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.6"
              />
              <circle
                cx={xFor(points.length - 1)}
                cy={yFor(latestPoint?.totalsByPlayer?.[player.id])}
                r="3.4"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] md:grid-cols-4">
        {players.map((player, index) => {
          const latest = points.at(-1)?.totalsByPlayer?.[player.id] || 0;
          return (
            <div key={player.id} className="flex min-w-0 items-center gap-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length] }} />
              <span className="truncate font-semibold text-[#374151]">{player.name}</span>
              <span className="shrink-0 font-mono text-[#6b7280]">{formatSignedNumber(latest)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
