import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsApi, surveysApi } from '../services/api';
import { PageHeader, StatusBadge, Spinner } from '../components/ui';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [selectedSurvey, setSelectedSurvey] = useState('');

  const { data: overview } = useQuery({ queryKey: ['analytics-overview'], queryFn: analyticsApi.overview });
  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: surveysApi.getAll });
  const { data: surveyStats, isLoading: loadingStats } = useQuery({
    queryKey: ['analytics-survey', selectedSurvey],
    queryFn: () => analyticsApi.survey(selectedSurvey),
    enabled: !!selectedSurvey,
  });

  const statusData = [
    { name: 'Draft',     value: surveys.filter((s) => s.status === 'draft').length },
    { name: 'Published', value: surveys.filter((s) => s.status === 'published').length },
    { name: 'Closed',    value: surveys.filter((s) => s.status === 'closed').length },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-8">
      <PageHeader title="Analytics" subtitle="Insights across all your surveys" />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Surveys',    value: overview?.total_surveys },
          { label: 'Total Responses',  value: overview?.total_responses },
          { label: 'Total Clients',    value: overview?.total_clients },
          { label: 'Avg Completion',   value: overview?.avg_completion_rate != null ? `${overview.avg_completion_rate}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="text-3xl font-bold text-indigo-600">{value ?? '—'}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Survey Status Pie */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Survey Status Distribution</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No survey data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Response count bar chart (top 5 surveys) */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Responses by Survey (Top 5)</h3>
          {surveys.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={surveys.slice(0, 5).map((s) => ({ name: s.title.slice(0, 20), responses: s.SurveyAnalytic?.total_responses || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="responses" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per-survey drill-down */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="font-semibold text-gray-900">Survey Drill-down</h3>
          <select className="input w-72" value={selectedSurvey} onChange={(e) => setSelectedSurvey(e.target.value)}>
            <option value="">Select a survey…</option>
            {surveys.map((s) => <option key={s.survey_id} value={s.survey_id}>{s.title}</option>)}
          </select>
        </div>

        {!selectedSurvey && <p className="text-sm text-gray-400 text-center py-8">Choose a survey to see question-level analytics.</p>}

        {loadingStats && <div className="flex justify-center py-8"><Spinner className="text-indigo-600 w-5 h-5" /></div>}

        {surveyStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-700">{surveyStats.total_responses}</p>
                <p className="text-xs text-indigo-500 mt-1">Total Responses</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{surveyStats.completion_rate}%</p>
                <p className="text-xs text-green-500 mt-1">Completion Rate</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{surveyStats.avg_rating ?? '—'}</p>
                <p className="text-xs text-yellow-500 mt-1">Avg Rating</p>
              </div>
            </div>

            {surveyStats.question_stats?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  Question Breakdown
                  <span className="text-xs font-normal text-gray-400">({surveyStats.question_stats.length} questions)</span>
                </h4>

                {/* Answer count bar chart */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Answers Received per Question</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={surveyStats.question_stats.map((q, i) => ({
                      name:    `Q${i + 1}`,
                      answers: Number(q.answer_count) || 0,
                      avg:     parseFloat(q.avg_value) || 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip formatter={(v, n) => [v, n]} />
                      <Bar dataKey="answers" fill="#6366f1" radius={[4, 4, 0, 0]} name="Answers received" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Per-question detail cards */}
                <div className="space-y-3">
                  {surveyStats.question_stats.map((q, i) => (
                    <div key={q.question_id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-1">{q.question_text}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5 font-medium">
                              {q.question_type}
                            </span>
                            <span className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-2 py-0.5 font-medium">
                              {Number(q.answer_count) || 0} answers
                            </span>
                            {q.avg_value != null && Number(q.avg_value) > 0 && (
                              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-full px-2 py-0.5 font-medium">
                                Avg: {parseFloat(q.avg_value).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Option distribution for choice questions */}
                          {['mcq', 'checkbox', 'dropdown'].includes(q.question_type) && q.options?.length > 0 && (
                            <div className="space-y-1.5 mt-2">
                              {q.options.filter(o => Number(o.selected_count) > 0).map((opt, oi) => {
                                const total = q.options.reduce((s, o) => s + Number(o.selected_count), 0) || 1;
                                const pct   = Math.round((Number(opt.selected_count) / total) * 100);
                                return (
                                  <div key={opt.option_id || oi}>
                                    <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                                      <span className="truncate max-w-xs">{opt.option_text}</span>
                                      <span className="ml-2 flex-shrink-0">{opt.selected_count} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                              {q.options.every(o => Number(o.selected_count) === 0) && (
                                <p className="text-xs text-gray-400 italic">No selections yet</p>
                              )}
                            </div>
                          )}

                          {/* Numeric avg for rating/scale */}
                          {['rating', 'scale'].includes(q.question_type) && (
                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full"
                                  style={{ width: `${q.question_type === 'rating'
                                    ? ((parseFloat(q.avg_value)||0)/5)*100
                                    : ((parseFloat(q.avg_value)||0)/10)*100}%` }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700">
                                {q.avg_value != null ? parseFloat(q.avg_value).toFixed(2) : '—'} /
                                {q.question_type === 'rating' ? '5' : '10'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
