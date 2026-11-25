import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  Legend,
} from 'recharts';

export const ClusterScatterChart = ({
  students = [],
  title = 'Student Trajectory Feature Space (Attendance Slope vs Grade Slope)',
  height = 360,
}) => {
  if (!students || students.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
        No student feature vectors available for scatter visualization.
      </div>
    );
  }

  // Group students by cluster
  const clustersGrouped = {};
  students.forEach((s) => {
    const cId = s.cluster_id !== undefined && s.cluster_id !== null ? s.cluster_id : 0;
    if (!clustersGrouped[cId]) {
      clustersGrouped[cId] = {
        name: s.profile_label || `Cluster ${cId}`,
        data: [],
        color:
          s.risk_category === 'High Risk'
            ? '#EF4444'
            : s.risk_category === 'Moderate Risk'
            ? '#F59E0B'
            : s.risk_category === 'Recovering'
            ? '#3B82F6'
            : '#10B981',
      };
    }
    clustersGrouped[cId].data.push({
      x: s.attendance_slope !== undefined ? Number(s.attendance_slope.toFixed(2)) : 0,
      y: s.grade_slope !== undefined ? Number(s.grade_slope.toFixed(2)) : 0,
      student_id: s.student_id,
      name: s.name,
      mean_attendance: s.mean_attendance,
      mean_grade: s.mean_grade,
      profile: s.profile_label,
      risk: s.risk_category,
    });
  });

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-md">
          <div className="font-semibold text-white flex items-center justify-between gap-3">
            <span>{data.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">{data.student_id}</span>
          </div>
          <p className="text-blue-400 font-medium">{data.profile}</p>
          <div className="pt-1.5 border-t border-slate-800 space-y-0.5 text-slate-300">
            <div>Att Slope: <span className="font-mono text-white">{data.x} %/wk</span></div>
            <div>Grade Slope: <span className="font-mono text-white">{data.y} pts/wk</span></div>
            <div>Avg Att: <span className="font-mono text-white">{data.mean_attendance}%</span></div>
            <div>Avg Grade: <span className="font-mono text-white">{data.mean_grade}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic grouping reveals distinctive quadrant vectors (severe dual decline in bottom-left)
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="x"
              name="Attendance Slope"
              stroke="#64748b"
              fontSize={11}
              label={{ value: 'Attendance Trend Slope (Δ % / week)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Grade Slope"
              stroke="#64748b"
              fontSize={11}
              label={{ value: 'Grade Trend Slope (Δ pts / week)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
            />
            <ZAxis range={[50, 50]} />
            <Tooltip content={customTooltip} />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: 10, fontSize: '12px' }}
            />
            {Object.entries(clustersGrouped).map(([cId, group]) => (
              <Scatter
                key={cId}
                name={group.name}
                data={group.data}
                fill={group.color}
                opacity={0.85}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
