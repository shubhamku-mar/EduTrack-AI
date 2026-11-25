import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Award,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { TrajectoryTrendChart } from '../components/charts/TrajectoryTrendChart';
import { api } from '../services/api';

export const StudentRecords = () => {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  // Student Detail Modal state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search: searchTerm,
        semester: selectedSemester || undefined,
        risk_category: selectedRisk !== 'All' ? selectedRisk : undefined,
        limit: pageSize,
        offset: page * pageSize,
      });
      setStudents(res.students || []);
      setTotalStudents(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, selectedSemester, selectedRisk, page]);

  const handleOpenDetail = async (studentId) => {
    setSelectedStudentId(studentId);
    setDetailLoading(true);
    try {
      const res = await api.getStudentDetail(studentId);
      setStudentDetail(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedStudentId(null);
    setStudentDetail(null);
  };

  const totalPages = Math.ceil(totalStudents / pageSize) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Filters Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Student Academic & Attendance Records
            </h3>
            <p className="text-xs text-slate-400">
              Query longitudinal records, filter by trajectory risk, and inspect individual student histories
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Showing {students.length} of {totalStudents} students
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, or department..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Semester Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Semesters</option>
              <option value="2">Semester 2</option>
              <option value="4">Semester 4</option>
              <option value="6">Semester 6</option>
            </select>
          </div>

          {/* Risk Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Risk Profile:</span>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="High Risk">High Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Recovering">Recovering</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Name & Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Trajectory Profile</th>
                <th className="py-3 px-4">Risk Category</th>
                <th className="py-3 px-4">Avg Att.</th>
                <th className="py-3 px-4">Att. Slope</th>
                <th className="py-3 px-4">Avg Grade</th>
                <th className="py-3 px-4">Grade Slope</th>
                <th className="py-3 px-4">Dropout Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={11} className="py-4 px-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No students matching the selected search and filter criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isDropout = student.historical_dropout_status === 1;
                  const attSlope = student.attendance_slope !== null ? student.attendance_slope : 0;
                  const gradeSlope = student.grade_slope !== null ? student.grade_slope : 0;

                  return (
                    <tr
                      key={student.student_id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">
                        {student.student_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{student.name}</div>
                        <div className="text-[10px] text-slate-400">{student.department}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">Sem {student.semester}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">
                          {student.profile_label || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge size="xs">{student.risk_category || 'Low Risk'}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {student.mean_attendance ? `${student.mean_attendance}%` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-flex items-center gap-0.5 ${
                            attSlope < -1.0
                              ? 'text-rose-400 font-semibold'
                              : attSlope > 0.5
                              ? 'text-emerald-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {attSlope > 0 ? `+${attSlope.toFixed(2)}` : attSlope.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {student.mean_grade ? `${student.mean_grade}%` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-flex items-center gap-0.5 ${
                            gradeSlope < -1.0
                              ? 'text-rose-400 font-semibold'
                              : gradeSlope > 0.5
                              ? 'text-emerald-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {gradeSlope > 0 ? `+${gradeSlope.toFixed(2)}` : gradeSlope.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isDropout ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Historical Drop
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Retained
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => handleOpenDetail(student.student_id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={ChevronLeft}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Individual Student Detail Modal */}
      <Modal
        isOpen={Boolean(selectedStudentId)}
        onClose={handleCloseDetail}
        title={studentDetail ? `${studentDetail.name} (${studentDetail.student_id})` : 'Student History'}
        subtitle={studentDetail ? `${studentDetail.department} • Semester ${studentDetail.semester}` : ''}
        maxWidth="max-w-4xl"
      >
        {detailLoading || !studentDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trajectory Profile Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Assigned Profile</span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {studentDetail.trajectory_summary?.profile_label || 'Consistently Engaged'}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge size="md">
                  {studentDetail.trajectory_summary?.risk_category || 'Low Risk'}
                </Badge>
                {studentDetail.historical_dropout_status === 1 ? (
                  <Badge variant="danger" size="md">
                    Historical Dropout Record
                  </Badge>
                ) : (
                  <Badge variant="success" size="md">
                    Continued Enrolment
                  </Badge>
                )}
              </div>
            </div>

            {/* Trajectory Slope Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <p className="text-[11px] text-slate-400">Mean Attendance</p>
                <p className="text-lg font-bold text-white mt-1">
                  {studentDetail.trajectory_summary?.mean_attendance || 0}%
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  Slope: {studentDetail.trajectory_summary?.attendance_slope?.toFixed(2)} %/wk
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <p className="text-[11px] text-slate-400">Mean Assessment</p>
                <p className="text-lg font-bold text-white mt-1">
                  {studentDetail.trajectory_summary?.mean_grade || 0}%
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  Slope: {studentDetail.trajectory_summary?.grade_slope?.toFixed(2)} pts/wk
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <p className="text-[11px] text-slate-400">Attendance Volatility</p>
                <p className="text-lg font-bold text-white mt-1">
                  ±{studentDetail.trajectory_summary?.attendance_variability || 0}%
                </p>
                <span className="text-[10px] text-slate-400">Std Deviation</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <p className="text-[11px] text-slate-400">Mean Engagement</p>
                <p className="text-lg font-bold text-white mt-1">
                  {studentDetail.trajectory_summary?.mean_engagement || 0}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  Slope: {studentDetail.trajectory_summary?.engagement_slope?.toFixed(2)}/wk
                </span>
              </div>
            </div>

            {/* 16-Week Longitudinal Chart */}
            <TrajectoryTrendChart
              data={studentDetail.records.map((r) => ({
                week: r.week,
                avg_attendance: r.attendance_percentage,
                avg_grade: r.composite_grade,
                avg_engagement: r.engagement_score,
              }))}
              title={`16-Week Longitudinal Trajectory for ${studentDetail.student_id}`}
              subtitle="Weekly attendance percentage, composite grade score, and engagement index"
              height={260}
            />

            {/* Weekly Records Table */}
            <div>
              <h5 className="text-xs font-semibold text-slate-300 uppercase mb-2">
                Weekly Raw Records
              </h5>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-slate-800/80 sticky top-0 text-slate-400 font-medium">
                    <tr>
                      <th className="py-2 px-3">Week</th>
                      <th className="py-2 px-3">Attended / Held</th>
                      <th className="py-2 px-3">Att. %</th>
                      <th className="py-2 px-3">Assignment</th>
                      <th className="py-2 px-3">Quiz</th>
                      <th className="py-2 px-3">Internal</th>
                      <th className="py-2 px-3">LMS Logins</th>
                      <th className="py-2 px-3">Study Hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {studentDetail.records.map((rec) => (
                      <tr key={rec.week} className="hover:bg-slate-800/30">
                        <td className="py-1.5 px-3 font-semibold text-white">W{rec.week}</td>
                        <td className="py-1.5 px-3">
                          {rec.classes_attended} / {rec.classes_held}
                        </td>
                        <td className="py-1.5 px-3 font-mono">{rec.attendance_percentage}%</td>
                        <td className="py-1.5 px-3 font-mono">{rec.assignment_score}</td>
                        <td className="py-1.5 px-3 font-mono">{rec.quiz_score}</td>
                        <td className="py-1.5 px-3 font-mono">{rec.internal_assessment_score}</td>
                        <td className="py-1.5 px-3 font-mono">{rec.lms_logins}</td>
                        <td className="py-1.5 px-3 font-mono">{rec.study_hours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
