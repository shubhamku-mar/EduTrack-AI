import React, { useMemo } from 'react';

export const DendrogramChart = ({ dendrogramData, height = 380, title = 'Agglomerative Clustering Dendrogram Tree' }) => {
  if (!dendrogramData || !dendrogramData.icoord || dendrogramData.icoord.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
        No dendrogram data available. Execute clustering to generate.
      </div>
    );
  }

  const { icoord, dcoord, color_list, threshold, ivl } = dendrogramData;

  // Compute bounding box for SVG
  const { minX, maxX, maxY } = useMemo(() => {
    let min_x = Infinity;
    let max_x = -Infinity;
    let max_y = 0;

    icoord.forEach((branch) => {
      branch.forEach((x) => {
        if (x < min_x) min_x = x;
        if (x > max_x) max_x = x;
      });
    });

    dcoord.forEach((branch) => {
      branch.forEach((y) => {
        if (y > max_y) max_y = y;
      });
    });

    return {
      minX: min_x === Infinity ? 0 : min_x - 10,
      maxX: max_x === -Infinity ? 100 : max_x + 10,
      maxY: max_y === 0 ? 10 : max_y * 1.08,
    };
  }, [icoord, dcoord]);

  const svgWidth = 900;
  const svgHeight = height;
  const padBottom = 40;
  const padTop = 30;
  const padLeft = 45;
  const padRight = 25;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Coordinate transforms
  const scaleX = (x) => padLeft + ((x - minX) / (maxX - minX || 1)) * plotWidth;
  const scaleY = (y) => padTop + (1 - (y / maxY)) * plotHeight;

  // Color mapping
  const getColor = (cCode) => {
    switch (cCode) {
      case 'C0': return '#3B82F6'; // blue
      case 'C1': return '#F59E0B'; // amber
      case 'C2': return '#10B981'; // emerald
      case 'C3': return '#EF4444'; // red
      case 'C4': return '#8B5CF6'; // purple
      case 'C5': return '#EC4899'; // pink
      default: return '#64748B'; // slate grey
    }
  };

  const thresholdY = threshold ? scaleY(threshold) : null;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="text-xs text-slate-400">
            Hierarchical merge distances with cluster cut-off threshold ({threshold ? threshold.toFixed(2) : 'N/A'})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-3 h-0.5 bg-rose-500 border-dashed" />
            Cut-off Threshold
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          {/* Y Axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const val = maxY * frac;
            const yPos = scaleY(val);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={svgWidth - padRight}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={yPos + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Dendrogram Branches */}
          {icoord.map((branchX, idx) => {
            const branchY = dcoord[idx];
            const color = getColor(color_list[idx]);
            const d = `M ${scaleX(branchX[0])} ${scaleY(branchY[0])} L ${scaleX(branchX[1])} ${scaleY(branchY[1])} L ${scaleX(branchX[2])} ${scaleY(branchY[2])} L ${scaleX(branchX[3])} ${scaleY(branchY[3])}`;
            return (
              <path
                key={idx}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                className="hover:stroke-white transition-colors duration-150"
              />
            );
          })}

          {/* Cluster Cut-off Threshold Line */}
          {thresholdY !== null && (
            <g>
              <line
                x1={padLeft}
                y1={thresholdY}
                x2={svgWidth - padRight}
                y2={thresholdY}
                stroke="#EF4444"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - padRight - 5}
                y={thresholdY - 6}
                fill="#EF4444"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                Threshold ({threshold.toFixed(2)})
              </text>
            </g>
          )}

          {/* Leaf labels along bottom */}
          {ivl && ivl.slice(0, 30).map((lbl, idx) => {
            const xPos = padLeft + (idx / (ivl.length - 1 || 1)) * plotWidth;
            return (
              <text
                key={idx}
                x={xPos}
                y={svgHeight - 12}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
              >
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
