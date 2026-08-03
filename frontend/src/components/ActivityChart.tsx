import { useState } from 'react';

import { MonthlyActivity, getMonthlyActivity } from '@/utils/dashboard';
import { EIPDiffsPerMonth } from '@/types/eip_diff';
import { CATEGORY_DETAILS, CategorySlug } from '@/utils/constants';
import { formatMonth, formatNumber, formatShortMonth } from '@/utils/formatters';

interface ActivityChartProps {
  category: CategorySlug;
  rows: EIPDiffsPerMonth[];
}

interface ChartGeometry {
  height: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  width: number;
}

const CHANGES_COLOR = '#1d5fae';
const CONTRIBUTORS_COLOR = '#b9471e';

function getNiceScale(maximum: number): { maximum: number; ticks: number[] } {
  const roughStep = Math.max(maximum, 1) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = multiplier * magnitude;
  const tickIntervals = 4;
  const niceMaximum = Math.max(step, step * tickIntervals);

  return {
    maximum: niceMaximum,
    ticks: Array.from({ length: tickIntervals + 1 }, (_, index) => index * step),
  };
}

function getTickIndices(length: number, requestedTicks: number): number[] {
  if (length <= requestedTicks) {
    return Array.from({ length }, (_, index) => index);
  }

  return Array.from(
    new Set(
      Array.from({ length: requestedTicks }, (_, index) =>
        Math.round((index * (length - 1)) / (requestedTicks - 1)),
      ),
    ),
  );
}

function ProposalActivitySvg({
  data,
  geometry,
  id,
  label,
  xTickCount,
}: {
  data: MonthlyActivity[];
  geometry: ChartGeometry;
  id: string;
  label: string;
  xTickCount: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { height, marginBottom, marginLeft, marginRight, marginTop, width } = geometry;
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;
  const changesScale = getNiceScale(Math.max(...data.map((row) => row.changes)));
  const contributorsScale = getNiceScale(Math.max(...data.map((row) => row.contributors)));
  const x = (index: number) => marginLeft + (index / Math.max(data.length - 1, 1)) * plotWidth;
  const changesY = (value: number) =>
    marginTop + plotHeight - (value / changesScale.maximum) * plotHeight;
  const contributorsY = (value: number) =>
    marginTop + plotHeight - (value / contributorsScale.maximum) * plotHeight;
  const changesLinePoints = data
    .map((row, index) => `${x(index)},${changesY(row.changes)}`)
    .join(' ');
  const contributorsLinePoints = data
    .map((row, index) => `${x(index)},${contributorsY(row.contributors)}`)
    .join(' ');
  const areaPoints = `${marginLeft},${marginTop + plotHeight} ${changesLinePoints} ${
    marginLeft + plotWidth
  },${marginTop + plotHeight}`;
  const xTickIndices = getTickIndices(data.length, xTickCount);
  const latest = data.at(-1)!;
  const latestX = x(data.length - 1);
  const latestChangesY = changesY(latest.changes);
  const latestContributorsY = contributorsY(latest.contributors);
  const activeRow = activeIndex === null ? null : data[activeIndex];
  const activeX = activeIndex === null ? 0 : x(activeIndex);
  const activeChangesY = activeRow ? changesY(activeRow.changes) : 0;
  const activeContributorsY = activeRow ? contributorsY(activeRow.contributors) : 0;
  const tooltipWidth = width < 500 ? 184 : 196;
  const tooltipX = Math.min(
    Math.max(activeX - tooltipWidth / 2, marginLeft),
    width - marginRight - tooltipWidth,
  );
  const tooltipY = Math.max(marginTop + 4, Math.min(activeChangesY, activeContributorsY) - 88);

  function moveSelection(direction: -1 | 1) {
    setActiveIndex((current) => {
      const startingIndex = current ?? data.length - 1;
      return Math.min(Math.max(startingIndex + direction, 0), data.length - 1);
    });
  }

  return (
    <svg
      className='activity-chart'
      viewBox={`0 0 ${width} ${height}`}
      role='img'
      aria-labelledby={`${id}-title ${id}-description`}
      tabIndex={0}
      onBlur={() => setActiveIndex(null)}
      onFocus={() => setActiveIndex((current) => current ?? data.length - 1)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          moveSelection(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
      onPointerLeave={() => setActiveIndex(null)}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const viewBoxX = ((event.clientX - bounds.left) / bounds.width) * width;
        const ratio = (viewBoxX - marginLeft) / plotWidth;
        setActiveIndex(
          Math.min(Math.max(Math.round(ratio * (data.length - 1)), 0), data.length - 1),
        );
      }}
    >
      <title id={`${id}-title`}>{label}</title>
      <desc id={`${id}-description`}>
        {`Monthly proposal changes from ${formatMonth(data[0].month)} through ${formatMonth(
          latest.month,
        )}. The latest complete month had ${formatNumber(latest.changes)} changes from ${formatNumber(
          latest.contributors,
        )} unique contributors.`}
      </desc>
      <defs>
        <linearGradient id={`${id}-fill`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stopColor={CHANGES_COLOR} stopOpacity='0.12' />
          <stop offset='100%' stopColor={CHANGES_COLOR} stopOpacity='0.02' />
        </linearGradient>
      </defs>

      <text x={marginLeft} y='13' fill={CHANGES_COLOR} fontSize='11' fontWeight='700'>
        Proposal changes
      </text>
      <text
        x={marginLeft + plotWidth}
        y='13'
        fill={CONTRIBUTORS_COLOR}
        fontSize='11'
        fontWeight='700'
        textAnchor='end'
      >
        Unique contributors
      </text>

      {changesScale.ticks.map((tick, index) => (
        <g key={tick}>
          <line
            x1={marginLeft}
            x2={marginLeft + plotWidth}
            y1={changesY(tick)}
            y2={changesY(tick)}
            stroke='#e1e7ef'
            vectorEffect='non-scaling-stroke'
          />
          <text
            x={marginLeft - 12}
            y={changesY(tick)}
            dy='0.35em'
            fill={CHANGES_COLOR}
            fontSize='12'
            fontWeight='600'
            textAnchor='end'
          >
            {formatNumber(tick)}
          </text>
          <text
            x={marginLeft + plotWidth + 12}
            y={changesY(tick)}
            dy='0.35em'
            fill={CONTRIBUTORS_COLOR}
            fontSize='12'
            fontWeight='600'
            textAnchor='start'
          >
            {formatNumber(contributorsScale.ticks[index])}
          </text>
        </g>
      ))}

      <polygon points={areaPoints} fill={`url(#${id}-fill)`} />
      <polyline
        points={changesLinePoints}
        fill='none'
        stroke={CHANGES_COLOR}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.5'
        vectorEffect='non-scaling-stroke'
      />
      <polyline
        points={contributorsLinePoints}
        fill='none'
        stroke={CONTRIBUTORS_COLOR}
        strokeDasharray='6 5'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.5'
        vectorEffect='non-scaling-stroke'
      />
      <circle
        cx={latestX}
        cy={latestChangesY}
        fill={CHANGES_COLOR}
        r='4'
        stroke='white'
        strokeWidth='2'
        vectorEffect='non-scaling-stroke'
      >
        <title>{`${formatMonth(latest.month)}: ${formatNumber(latest.changes)} changes`}</title>
      </circle>
      <circle
        cx={latestX}
        cy={latestContributorsY}
        fill={CONTRIBUTORS_COLOR}
        r='4'
        stroke='white'
        strokeWidth='2'
        vectorEffect='non-scaling-stroke'
      >
        <title>{`${formatMonth(latest.month)}: ${formatNumber(
          latest.contributors,
        )} unique contributors`}</title>
      </circle>

      {activeRow ? (
        <g aria-hidden='true' pointerEvents='none'>
          <line
            x1={activeX}
            x2={activeX}
            y1={marginTop}
            y2={marginTop + plotHeight}
            stroke='#94a3b8'
            vectorEffect='non-scaling-stroke'
          />
          <circle
            cx={activeX}
            cy={activeChangesY}
            fill={CHANGES_COLOR}
            r='4'
            stroke='white'
            strokeWidth='2'
            vectorEffect='non-scaling-stroke'
          />
          <circle
            cx={activeX}
            cy={activeContributorsY}
            fill={CONTRIBUTORS_COLOR}
            r='4'
            stroke='white'
            strokeWidth='2'
            vectorEffect='non-scaling-stroke'
          />
          <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height='72' rx='10' fill='#0f172a' />
          <text x={tooltipX + 12} y={tooltipY + 19} fill='#cbd5e1' fontSize='11'>
            {formatMonth(activeRow.month)}
          </text>
          <line
            x1={tooltipX + 12}
            x2={tooltipX + 25}
            y1={tooltipY + 38}
            y2={tooltipY + 38}
            stroke={CHANGES_COLOR}
            strokeWidth='2.5'
          />
          <text x={tooltipX + 32} y={tooltipY + 42} fill='white' fontSize='12' fontWeight='650'>
            {formatNumber(activeRow.changes)} changes
          </text>
          <line
            x1={tooltipX + 12}
            x2={tooltipX + 25}
            y1={tooltipY + 59}
            y2={tooltipY + 59}
            stroke={CONTRIBUTORS_COLOR}
            strokeDasharray='4 3'
            strokeWidth='2.5'
          />
          <text x={tooltipX + 32} y={tooltipY + 63} fill='white' fontSize='12' fontWeight='650'>
            {formatNumber(activeRow.contributors)} contributors
          </text>
        </g>
      ) : null}

      {xTickIndices.map((index) => (
        <text
          key={data[index].month}
          x={x(index)}
          y={height - 10}
          fill='#64748b'
          fontSize='12'
          textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
        >
          {formatShortMonth(data[index].month)}
        </text>
      ))}
    </svg>
  );
}

export default function ActivityChart({ category, rows }: ActivityChartProps) {
  const data = getMonthlyActivity(rows, category);
  const label = `${CATEGORY_DETAILS[category].label} proposal changes and unique contributors by month`;

  if (data.length === 0) {
    return (
      <div className='chart-empty' role='status'>
        Monthly activity will appear here after the first complete data period.
      </div>
    );
  }

  return (
    <>
      <div
        className='mb-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600'
        aria-label='Chart series'
      >
        <span className='inline-flex items-center gap-2'>
          <svg width='18' height='8' viewBox='0 0 18 8' aria-hidden='true'>
            <line x1='1' x2='17' y1='4' y2='4' stroke={CHANGES_COLOR} strokeWidth='2.5' />
          </svg>
          Proposal changes · left axis
        </span>
        <span className='inline-flex items-center gap-2'>
          <svg width='18' height='8' viewBox='0 0 18 8' aria-hidden='true'>
            <line
              x1='1'
              x2='17'
              y1='4'
              y2='4'
              stroke={CONTRIBUTORS_COLOR}
              strokeDasharray='5 3'
              strokeWidth='2.5'
            />
          </svg>
          Unique contributors · right axis
        </span>
      </div>
      <div className='hidden sm:block'>
        <ProposalActivitySvg
          data={data}
          geometry={{
            height: 336,
            marginBottom: 36,
            marginLeft: 60,
            marginRight: 60,
            marginTop: 28,
            width: 1_000,
          }}
          id='activity-desktop'
          label={label}
          xTickCount={9}
        />
      </div>
      <div className='sm:hidden'>
        <ProposalActivitySvg
          data={data}
          geometry={{
            height: 316,
            marginBottom: 36,
            marginLeft: 42,
            marginRight: 42,
            marginTop: 28,
            width: 360,
          }}
          id='activity-mobile'
          label={label}
          xTickCount={4}
        />
      </div>
    </>
  );
}
