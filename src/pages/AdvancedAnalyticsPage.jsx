import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';
import {
  Clock, Globe, Smartphone, Monitor, Tablet,
  TrendingUp, TrendingDown, Minus, BarChart2,
  Smile, Frown, Meh, AlertTriangle, Send, CheckCircle,
} from 'lucide-react';
import { analyticsApi, surveysApi } from '../services/api';
import { PageHeader, Spinner, StatusBadge } from '../components/ui';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

const CHANNEL_ICONS = {
  qr:       '📷', email: '📧', whatsapp: '💬',
  link:     '🔗', venue: '📍', sms:      '📱', other: '🌐',
};
const CHANNEL_COLORS = {
  qr:'#6366f1', email:'#10b981', whatsapp:'#25D366',
  link:'#f59e0b', venue:'#ef4444', sms:'#8b5cf6', other:'#9CA3AF',
};

function fmtSecs(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${s}s`;
}

// ─── KPI card ────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, icon: Icon, color = 'text-indigo-600', bg = 'bg-indigo-50' }) {
  return (
    <div className={`card flex items-start gap-4 ${bg} border-0`}>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon size={20} className={color} />
        </div>
      )}
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
        <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Sentiment gauge ─────────────────────────────────────────────────────────
function SentimentGauge({ score }) {
  if (score == null) return <p className="text-sm text-gray-400 py-4 text-center">No sentiment data yet.</p>;
  const pct   = ((score + 1) / 2) * 100;
  const color = score > 0.1 ? '#10b981' : score < -0.1 ? '#ef4444' : '#f59e0b';
  const label = score > 0.1 ? 'Positive' : score < -0.1 ? 'Negative' : 'Neutral';
  const Icon  = score > 0.1 ? Smile : score < -0.1 ? Frown : Meh;
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <Icon size={40} style={{ color }} />
      <p className="text-3xl font-bold" style={{ color }}>{label}</p>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-sm text-gray-500">Score: {score.toFixed(3)} (−1 = very negative, +1 = very positive)</p>
    </div>
  );
}

// ─── Drop-off funnel ─────────────────────────────────────────────────────────
function DropOffFunnel({ data = [] }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-8 text-center">No drop-off data yet. Respondents must start the survey to generate this report.</p>;
  const maxReached = Math.max(...data.map((d) => d.reached), 1);
  return (
    <div className="space-y-2">
      {data.map((q, i) => {
        const answerPct  = q.reached > 0 ? (q.answered / q.reached) * 100 : 0;
        const dropColor  = q.drop_rate > 30 ? '#ef4444' : q.drop_rate > 15 ? '#f59e0b' : '#10b981';
        return (
          <div key={q.question_id} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-xs font-bold text-indigo-600 w-7 flex-shrink-0 mt-0.5">Q{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{q.question_text}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  <span>👁 Reached: <strong>{q.reached}</strong></span>
                  <span>✅ Answered: <strong>{q.answered}</strong></span>
                  <span style={{ color: dropColor }}>⬇ Dropped: <strong>{q.dropped_here}</strong> ({q.drop_rate}%)</span>
                  {q.avg_time_secs && <span>⏱ Avg time: <strong>{fmtSecs(q.avg_time_secs)}</strong></span>}
                </div>
              </div>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-200">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${answerPct}%` }} />
              <div className="h-full transition-all" style={{ width: `${100 - answerPct}%`, background: dropColor, opacity: 0.5 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdvancedAnalyticsPage() {
  const [surveyId, setSurveyId] = useState('');

  const { data: surveys = [] } = useQuery({
    queryKey: ['surveys'],
    queryFn:  surveysApi.getAll,
    staleTime: 30_000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['advanced-analytics', surveyId],
    queryFn:  () => analyticsApi.advanced(surveyId),
    enabled:  !!surveyId,
    staleTime: 30_000,
  });

  const selectedSurvey = surveys.find((s) => s.survey_id === surveyId);

  return (
    <div className="p-8">
      <PageHeader
        title="Advanced Analytics"
        subtitle="Sentiment, drop-off, channels, devices, locations and response timeline"
      />

      {/* Survey selector */}
      <div className="card mb-6 flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Select Survey</label>
        <select
          className="input w-80"
          value={surveyId}
          onChange={(e) => setSurveyId(e.target.value)}
        >
          <option value="">Choose a survey…</option>
          {surveys.map((s) => (
            <option key={s.survey_id} value={s.survey_id}>
              {s.title} ({s.status})
            </option>
          ))}
        </select>
        {selectedSurvey && <StatusBadge status={selectedSurvey.status} />}
      </div>

      {!surveyId && (
        <div className="card text-center py-16 text-gray-400">
          <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Select a survey to view advanced analytics</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16"><Spinner className="text-indigo-600 w-7 h-7" /></div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          Failed to load analytics. Make sure the survey has responses.
        </div>
      )}

      {data && (
        <div className="space-y-6">

          {/* ── Sent vs Received ─────────────────────────────────────────── */}
          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Send size={16} className="text-indigo-500" /> Sent vs Received
            </h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <KPI label="Total Sent (Assignments)"  value={data.sent_received.total_sent}       icon={Send}        color="text-blue-600"   bg="bg-blue-50" />
              <KPI label="Total Received"             value={data.sent_received.total_received}   icon={CheckCircle} color="text-green-600"  bg="bg-green-50" />
              <KPI label="Completed"                  value={data.sent_received.total_complete}   icon={CheckCircle} color="text-indigo-600" bg="bg-indigo-50" />
              <KPI
                label="Response Rate"
                value={data.sent_received.response_rate != null ? `${data.sent_received.response_rate}%` : '—'}
                icon={TrendingUp}
                color={data.sent_received.response_rate >= 50 ? 'text-green-600' : 'text-red-500'}
                bg={data.sent_received.response_rate >= 50 ? 'bg-green-50' : 'bg-red-50'}
              />
            </div>
          </section>

          {/* ── Completion Time ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" /> Average Completion Time
            </h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <KPI label="Average Time"  value={data.completion_time.avg_fmt} icon={Clock} color="text-indigo-600" bg="bg-indigo-50" />
              <KPI label="Fastest"       value={data.completion_time.min_fmt} icon={TrendingDown} color="text-green-600"  bg="bg-green-50" />
              <KPI label="Slowest"       value={data.completion_time.max_fmt} icon={TrendingUp}   color="text-red-500"    bg="bg-red-50" />
              <KPI label="Std Deviation" value={fmtSecs(data.completion_time.stddev_secs)} icon={Minus} color="text-gray-600" bg="bg-gray-50" />
            </div>
          </section>

          {/* ── Channels + Devices ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Channels */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Distribution Channels</h2>
              {!data.channels.length ? (
                <p className="text-sm text-gray-400 text-center py-6">No channel data yet.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.channels.map((c) => ({ name: c.channel, value: c.count }))}
                        cx="50%" cy="50%" outerRadius={80} dataKey="value"
                        label={({ name, percent }) => `${CHANNEL_ICONS[name] ?? '🌐'} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.channels.map((c, i) => (
                          <Cell key={i} fill={CHANNEL_COLORS[c.channel] ?? COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {data.channels.map((c) => {
                      const total = data.channels.reduce((s, x) => s + x.count, 0);
                      const pct   = total > 0 ? ((c.count / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={c.channel} className="flex items-center gap-3">
                          <span className="text-lg w-6 text-center">{CHANNEL_ICONS[c.channel] ?? '🌐'}</span>
                          <span className="text-sm text-gray-700 capitalize w-24">{c.channel}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: CHANNEL_COLORS[c.channel] ?? '#6366f1' }} />
                          </div>
                          <span className="text-xs text-gray-500 w-14 text-right">{c.count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Devices */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Device Breakdown</h2>
              {!data.devices.length ? (
                <p className="text-sm text-gray-400 text-center py-6">No device data yet.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.devices.map((d) => ({ name: d.device, value: d.count }))}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {data.devices.map((d) => {
                      const Icon  = d.device === 'mobile' ? Smartphone : d.device === 'tablet' ? Tablet : Monitor;
                      const total = data.devices.reduce((s, x) => s + x.count, 0);
                      const pct   = total > 0 ? ((d.count / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={d.device} className="flex items-center gap-3">
                          <Icon size={16} className="text-indigo-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 capitalize w-20">{d.device}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-14 text-right">{d.count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Locations ─────────────────────────────────────────────────── */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={16} className="text-indigo-500" /> Responses by Location
            </h2>
            {!data.locations.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No location data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Country','City','Responses','Share'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.locations.map((l, i) => {
                      const total = data.locations.reduce((s, x) => s + x.count, 0);
                      const pct   = ((l.count / total) * 100).toFixed(1);
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-800">{l.country}</td>
                          <td className="py-2 px-3 text-gray-500">{l.city || '—'}</td>
                          <td className="py-2 px-3 text-gray-800 font-medium">{l.count}</td>
                          <td className="py-2 px-3 w-36">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-400">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Sentiment ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Smile size={16} className="text-indigo-500" /> Overall Sentiment
              </h2>
              <SentimentGauge score={data.sentiment.overall_score} />
            </div>
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Sentiment Breakdown</h2>
              {!data.sentiment.breakdown.length ? (
                <p className="text-sm text-gray-400 text-center py-8">No sentiment data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.sentiment.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Responses" radius={[4,4,0,0]}>
                      {data.sentiment.breakdown.map((s, i) => (
                        <Cell key={i}
                          fill={s.label === 'positive' ? '#10b981' : s.label === 'negative' ? '#ef4444' : '#f59e0b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Drop-Off ──────────────────────────────────────────────────── */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Drop-Off Analysis
            </h2>
            <p className="text-xs text-gray-400 mb-4">Shows where respondents abandoned the survey. High drop rates (red) indicate problematic questions.</p>
            <DropOffFunnel data={data.drop_off} />
          </div>

          {/* ── Response Timeline ─────────────────────────────────────────── */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-500" /> Response Timeline (Last 30 Days)
            </h2>
            {!data.timeline.length ? (
              <p className="text-sm text-gray-400 text-center py-8">No responses in the last 30 days.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.timeline}>
                  <defs>
                    <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }}
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month:'short', day:'numeric' })} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d).toLocaleDateString()}
                    formatter={(v) => [v, 'Responses']}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                    fill="url(#responseGrad)" name="Responses" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
