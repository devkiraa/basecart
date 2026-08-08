"use client";

import React, { useState } from "react";

// Cloudflare Radar Colors
const CF_BLUE = "#2563EB";
const CF_GREEN = "#10B981";

interface DataPoint {
  label: string;
  value: number;
  subValue?: string;
}

interface SVGChartProps {
  data: DataPoint[];
  color: string;
  gradientId: string;
  valueFormatter: (val: number) => string;
  height?: number;
}

function InteractiveAreaChart({
  data,
  color,
  gradientId,
  valueFormatter,
  height = 200,
}: SVGChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.85;
  const maxVal = Math.max(...values) * 1.1;
  const range = maxVal - minVal || 1;

  const svgWidth = 500;
  const svgHeight = height;
  const paddingX = 40;
  const paddingY = 25;

  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * usableWidth;
    const y = paddingY + usableHeight - ((d.value - minVal) / range) * usableHeight;
    return { x, y, dataPoint: d, index: i };
  });

  // Build SVG path strings
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    svgHeight - paddingY
  } L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Grid lines
  const gridLineCount = 4;
  const gridYValues = Array.from({ length: gridLineCount }, (_, i) => {
    const val = minVal + (range / (gridLineCount - 1)) * i;
    const y = paddingY + usableHeight - ((val - minVal) / range) * usableHeight;
    return { val, y };
  });

  return (
    <div className="relative w-full h-full select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {gridYValues.map((g, idx) => (
          <g key={idx}>
            <line
              x1={paddingX}
              y1={g.y}
              x2={svgWidth - paddingX}
              y2={g.y}
              stroke="#f1f5f9"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={paddingX - 6}
              y={g.y + 3}
              fill="#94a3b8"
              fontSize="9"
              fontWeight="600"
              textAnchor="end"
            >
              {valueFormatter(g.val)}
            </text>
          </g>
        ))}

        {/* Area Fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X Axis Labels */}
        {points.map((pt) => (
          <text
            key={pt.index}
            x={pt.x}
            y={svgHeight - 6}
            fill="#94a3b8"
            fontSize="9"
            fontWeight="600"
            textAnchor="middle"
          >
            {pt.dataPoint.label}
          </text>
        ))}

        {/* Interactive Hover Indicators & Dots */}
        {points.map((pt) => {
          const isHovered = hoveredIdx === pt.index;
          return (
            <g key={`dot-${pt.index}`}>
              {/* Vertical Guide Line on Hover */}
              {isHovered && (
                <line
                  x1={pt.x}
                  y1={paddingY}
                  x2={pt.x}
                  y2={svgHeight - paddingY}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
              )}

              {/* Data Point Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5 : 3}
                fill={isHovered ? color : "#ffffff"}
                stroke={color}
                strokeWidth={2}
                className="transition-all duration-150 cursor-pointer"
              />

              {/* Invisible Hit Area for Hover */}
              <rect
                x={pt.x - usableWidth / (data.length * 2)}
                y={paddingY}
                width={usableWidth / data.length}
                height={usableHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(pt.index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700 flex flex-col gap-0.5 -translate-x-1/2 -translate-y-full mb-2 transition-all duration-100"
          style={{
            left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
            top: `${(points[hoveredIdx].y / svgHeight) * 100}%`,
          }}
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {points[hoveredIdx].dataPoint.label}
          </span>
          <span className="font-bold text-white">
            {valueFormatter(points[hoveredIdx].dataPoint.value)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Exported Components for Pages ──────────────────────────────────────────

const revenueTrendData: DataPoint[] = [
  { label: "May", value: 580000 },
  { label: "Jun", value: 710000 },
  { label: "Jul", value: 924000 },
  { label: "Aug (now)", value: 1249000 },
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
