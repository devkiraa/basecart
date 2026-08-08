"use client";

import React, { useState } from "react";

// Cloudflare Radar Colors
const CF_BLUE = "#2563EB";
const CF_GREEN = "#10B981";

export interface DataPoint {
  label: string;
  value: number;
  subValue?: string;
}

interface SVGChartProps {
  data: DataPoint[];
  color: string;
  gradientId: string;
  valueFormatter: (val: number) => string;
}

export function InteractiveAreaChart({
  data,
  color,
  gradientId,
  valueFormatter,
}: SVGChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  
  // Provide comfortable bounds
  const minVal = rawMin === rawMax ? (rawMin > 0 ? rawMin * 0.8 : 0) : Math.max(0, rawMin - (rawMax - rawMin) * 0.2);
  const maxVal = rawMin === rawMax ? (rawMax > 0 ? rawMax * 1.2 : 100) : rawMax + (rawMax - rawMin) * 0.2;
  const range = maxVal - minVal || 1;

  // Grid tick values (4 horizontal ticks)
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const val = maxVal - ((maxVal - minVal) / (tickCount - 1)) * i;
    return val;
  });

  const svgWidth = 500;
  const svgHeight = 160;
  const paddingY = 12;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * svgWidth;
    const norm = (d.value - minVal) / range;
    const y = paddingY + (1 - norm) * (svgHeight - paddingY * 2);
    return { x, y, dataPoint: d, index: i, normY: (1 - norm) * 100 };
  });

  // SVG path for line and area fill
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none font-sans">
      {/* Upper area: Y-axis labels + SVG Drawing Area */}
      <div className="flex flex-1 min-h-[140px] relative gap-3">
        {/* Y-Axis HTML Labels (Never stretched/distorted) */}
        <div className="flex flex-col justify-between py-1 text-right shrink-0 min-w-[48px]">
          {ticks.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold text-slate-400 leading-none select-none"
            >
              {valueFormatter(t)}
            </span>
          ))}
        </div>

        {/* SVG Canvas Area */}
        <div className="relative flex-1 h-full overflow-visible">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
            {ticks.map((_, idx) => (
              <div
                key={idx}
                className="w-full border-b border-dashed border-slate-100 h-0"
              />
            ))}
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible relative z-10"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaD} fill={`url(#${gradientId})`} />

            {/* Path Line */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Point Markers */}
            {points.map((pt) => {
              const isHovered = hoveredIdx === pt.index;
              return (
                <g key={`point-${pt.index}`}>
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={0}
                      x2={pt.x}
                      y2={svgHeight}
                      stroke={color}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? color : "#ffffff"}
                    stroke={color}
                    strokeWidth={2.5}
                    className="transition-all duration-150"
                  />
                  {/* Invisible Hit Slits */}
                  <rect
                    x={Math.max(0, pt.x - svgWidth / (data.length * 2))}
                    y={0}
                    width={svgWidth / data.length}
                    height={svgHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIdx(pt.index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>

          {/* HTML Hover Tooltip */}
          {hoveredIdx !== null && (
            <div
              className="absolute z-30 pointer-events-none bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 flex flex-col gap-0.5 -translate-x-1/2 -translate-y-full mb-3 whitespace-nowrap transition-all duration-75"
              style={{
                left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
                top: `${points[hoveredIdx].normY}%`,
              }}
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {points[hoveredIdx].dataPoint.label}
              </span>
              <span className="font-bold text-white text-xs">
                {valueFormatter(points[hoveredIdx].dataPoint.value)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* X-Axis HTML Labels */}
      <div className="flex justify-between pl-[60px] pr-1 pt-2.5 border-t border-slate-100">
        {data.map((d, i) => (
          <span
            key={i}
            className="text-[10px] font-bold text-slate-400 tracking-tight"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Preset Exported Charts ──────────────────────────────────────────────────

const revenueTrendData: DataPoint[] = [
  { label: "May 2026", value: 490000 },
  { label: "Jun 2026", value: 790000 },
  { label: "Jul 2026", value: 1080000 },
  { label: "Aug 2026 (Active)", value: 1370000 },
];

export function RevenueTrendChart() {
  return (
    <InteractiveAreaChart
      data={revenueTrendData}
      color={CF_BLUE}
      gradientId="revGrad"
      valueFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
    />
  );
}

const gmvData: DataPoint[] = [
  { label: "Jun 20", value: 120000 },
  { label: "Jun 25", value: 145000 },
  { label: "Jul 01", value: 132000 },
  { label: "Jul 07", value: 188000 },
  { label: "Jul 12", value: 220000 },
  { label: "Jul 17", value: 275000 },
  { label: "Jul 22", value: 310000 },
  { label: "Aug 01", value: 390000 },
];

export function GmvChart() {
  return (
    <InteractiveAreaChart
      data={gmvData}
      color={CF_BLUE}
      gradientId="gmvGrad"
      valueFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
    />
  );
}

const signupData: DataPoint[] = [
  { label: "Jun 20", value: 12 },
  { label: "Jun 25", value: 18 },
  { label: "Jul 01", value: 22 },
  { label: "Jul 07", value: 31 },
  { label: "Jul 12", value: 40 },
  { label: "Jul 17", value: 55 },
  { label: "Jul 22", value: 63 },
  { label: "Aug 01", value: 78 },
];

export function MerchantSignupsChart() {
  return (
    <InteractiveAreaChart
      data={signupData}
      color={CF_GREEN}
      gradientId="signupGrad"
      valueFormatter={(v) => `${Math.round(v)}`}
    />
  );
}
