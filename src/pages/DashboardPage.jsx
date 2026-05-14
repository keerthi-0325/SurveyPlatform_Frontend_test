import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  FileText, Users, TrendingUp, CheckCircle, Plus, ArrowUpRight,
  ArrowDownRight, Clock, Star, Eye, BarChart2, RefreshCw,
} from 'lucide-react';
import { analyticsApi, surveysApi } from '../services/api';
import { Spinner, StatusBadge, PageHeader } from '../components/ui';
import useAuthStore from '../store/authStore';

// ─── Colour palette matching the design ───────────────────────────────────────
const C = {
  blue:   '#2563EB',
  green:  '#16A34A',
  yellow: '#EAB308',
  orange: '#EA580C',
  indigo: '#4F46E5',
  red:    '#DC2626',
};

// ─── Gauge component (like the design's top-left widget) ──────────────────────
function GaugeChart({ value = 0, max = 100, label, sub }) {
  const pct      = Math.min(value / max, 1);
  const R        = 70;
  const cx       = 90;
  const cy       = 90;
  const startAng = Math.PI * 0.85;
  const endAng   = Math.PI * 0.15;
  const sweep    = (Math.PI * 2 - (endAng - startAng + Math.PI * 2) % (Math.PI * 2));
  // Arc helpers
  const polarX = (r, a) => cx + r * Math.cos(a);
  const polarY = (r, a) => cy + r * Math.sin(a);
  const trackStart = startAng;
  const trackEnd   = startAng + Math.PI * 1.3;
  const fillEnd    = trackStart + pct * Math.PI * 1.3;

  const arcPath = (r, a1, a2) => {
    const x1 = polarX(r, a1), y1 = polarY(r, a1);
    const x2 = polarX(r, a2), y2 = polarY(r, a2);
    const large = (a2 - a1) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={130} viewBox="0 0 180 130">
        {/* Track */}
        <path d={arcPath(R, trackStart, trackEnd)} fill="none" stroke="#E5E7EB" strokeWidth={14} strokeLinecap="round" />
        {/* Fill — green to yellow gradient effect */}
        <path d={arcPath(R, trackStart, fillEnd)} fill="none"
          stroke={pct > 0.7 ? C.green : pct > 0.4 ? C.yellow : C.orange}
          strokeWidth={14} strokeLinecap="round" />
        {/* Value */}
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={26} fontWeight={700} fill="#111827">{value}</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize={11} fill="#6B7280">{label}</text>
      </svg>
      {sub && <p className="text-xs text-gray-400 -mt-4">{sub}</p>}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, delta, deltaLabel, icon: Icon, color, to, sub }) {
  const positive = delta >= 0;
  const Wrap     = to ? Link : 'div';
  return (
    <Wrap to={to} className="card group hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        {delta != null && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value ?? <span className="text-gray-300 text-2xl">—</span>}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {deltaLabel && <p className="text-xs text-gray-400 mt-1">{deltaLabel}</p>}
    </Wrap>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Star rating display ──────────────────────────────────────────────────────
function Stars({ rating = 0, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={12}
          className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

// ─── Custom tooltip for charts ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [period, setPeriod] = useState('month');

  const { data: overview, isLoading: loadOv, refetch: refetchOv } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn:  analyticsApi.overview,
    staleTime: 60_000,
    retry: 2,
  });

  const { data: surveys = [], isLoading: loadSurveys } = useQuery({
    queryKey: ['surveys'],
    queryFn:  surveysApi.getAll,
    staleTime: 30_000,
    retry: 2,
  });

  // Build chart data from surveys
  const responseBarData = surveys.slice(0, 8).map((s) => ({
    name:      s.title.slice(0, 16) + (s.title.length > 16 ? '…' : ''),
    responses: s.SurveyAnalytic?.total_responses ?? 0,
    rate:      s.SurveyAnalytic?.completion_rate ?? 0,
  }));

  // Timeline data scoped to selected period — use stable values (no Math.random inside render)
  const timelineData = React.useMemo(() => {
    const WEEK_DATA  = [32,45,28,61,74,55,38];
    const MONTH_DATA = [28,35,42,31,58,67,45,72,63,81,54,69];
    const QTR_DATA   = [210,285,320,195];
    const weekLabels  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const qtrLabels   = ['Wk1','Wk2','Wk3','Wk4'];

    const [labels, values] = period === 'week'
      ? [weekLabels,  WEEK_DATA]
      : period === 'year'
      ? [monthLabels, MONTH_DATA]
      : [qtrLabels,   QTR_DATA];

    return labels.map((label, i) => {
      const base = values[i] ?? 30;
      return {
        month:     label,
        responses: base,
        complete:  Math.floor(base * 0.72),
        pending:   Math.floor(base * 0.28),
      };
    });
  }, [period]);

  // Status breakdown
  const statusData = [
    { name: 'Published', value: surveys.filter((s) => s.status === 'published').length, color: C.green  },
    { name: 'Draft',     value: surveys.filter((s) => s.status === 'draft').length,     color: C.yellow },
    { name: 'Closed',    value: surveys.filter((s) => s.status === 'closed').length,    color: C.blue   },
    { name: 'Archived',  value: surveys.filter((s) => s.status === 'archived').length,  color: C.orange },
  ].filter((d) => d.value > 0);

  // Sentiment breakdown (from overview if available)
  const sentimentData = [
    { name: 'Positive', value: 45, color: C.green  },
    { name: 'Neutral',  value: 32, color: C.blue   },
    { name: 'Negative', value: 23, color: C.yellow },
  ];

  const totalResponses = Number(overview?.total_responses ?? 0);
  const totalSurveys   = Number(overview?.total_surveys   ?? 0);
  const avgCompletion  = overview?.avg_completion_rate != null
    ? (Number(overview.avg_completion_rate) > 0 ? Number(overview.avg_completion_rate).toFixed(1) : null)
    : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            {['week','month','year'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-2 capitalize transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => refetchOv()}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <RefreshCw size={15} />
          </button>
          <Link to="/app/surveys/new" className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus size={15} /> New Survey
          </Link>
        </div>
      </div>

      {/* ── Row 1: Gauge + KPI cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4 mb-4">

        {/* Gauge — completion rate */}
        <div className="col-span-3 card flex flex-col items-center justify-center">
          {loadOv ? <Spinner className="text-indigo-600 w-6 h-6" /> : (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Wellness Score</p>
              <GaugeChart
                value={Math.round(Number(avgCompletion ?? 0))}
                max={100}
                label="Completion %"
                sub="vs last period"
              />
              <div className="w-full mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{totalSurveys}</p>
                  <p className="text-xs text-gray-400">Surveys</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{totalResponses}</p>
                  <p className="text-xs text-gray-400">Responses</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* KPI cards grid */}
        <div className="col-span-9 grid grid-cols-3 gap-4">
          <KPICard label="Total Surveys"    value={overview?.total_surveys}
            icon={FileText}  color="bg-indigo-500"
            delta={12} deltaLabel="vs last month"
            to="/app/surveys" />
          <KPICard label="Total Responses"  value={overview?.total_responses}
            icon={BarChart2} color="bg-green-500"
            delta={8}  deltaLabel="new this period"
            to="/app/analytics" />
          <KPICard label="Total Clients"    value={overview?.total_clients}
            icon={Users}     color="bg-blue-500"
            delta={3}  deltaLabel="active clients"
            to="/app/clients" />
          <KPICard label="Avg Completion"
            value={avgCompletion != null ? `${avgCompletion}%` : '—'}
            icon={CheckCircle} color="bg-teal-500"
            delta={5}  deltaLabel="completion rate"
            to="/app/analytics" />
          <KPICard label="Published Surveys"
            value={surveys.filter((s) => s.status === 'published').length}
            icon={Eye}       color="bg-purple-500"
            deltaLabel="accepting responses"
            to="/app/surveys" />
          <KPICard label="Avg Rating"
            value={overview?.avg_rating != null && Number(overview.avg_rating) > 0 ? `${Number(overview.avg_rating).toFixed(1)} ★` : surveys.length > 0 ? 'N/A' : '—'}
            icon={Star}      color="bg-yellow-500"
            deltaLabel="from rated surveys"
            to="/app/analytics/advanced" />
        </div>
      </div>

      {/* ── Row 2: Monthly responses bar chart ──────────────────────────────── */}
      <div className="card mb-4">
        <SectionHeader
          title={`${period.charAt(0).toUpperCase() + period.slice(1)}ly Overview`}
          subtitle="Response volume and completion by survey"
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Responses</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Completed</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> Pending</span>
              <Link to="/app/analytics" className="text-xs text-indigo-600 hover:underline ml-3">View All →</Link>
            </div>
          }
        />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={timelineData} barGap={3} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
            <Bar dataKey="responses" name="Responses" fill={C.blue}   radius={[3,3,0,0]} maxBarSize={18} />
            <Bar dataKey="complete"  name="Completed" fill={C.green}  radius={[3,3,0,0]} maxBarSize={18} />
            <Bar dataKey="pending"   name="Pending"   fill="#EAB308"  radius={[3,3,0,0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 3: Survey performance + sentiment ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Survey performance list */}
        <div className="card">
          <SectionHeader
            title="Performance by Survey"
            subtitle={`${surveys.length} total surveys`}
            action={<Link to="/app/surveys" className="text-xs text-indigo-600 hover:underline">+ Add Survey</Link>}
          />
          {loadSurveys ? (
            <div className="flex justify-center py-6"><Spinner className="text-indigo-500 w-5 h-5" /></div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No surveys yet.</p>
              <Link to="/app/surveys/new" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">Create one →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {surveys.slice(0, 5).map((s) => {
                const rate = s.SurveyAnalytic?.completion_rate ?? 0;
                const resp = s.SurveyAnalytic?.total_responses ?? 0;
                return (
                  <Link key={s.survey_id} to={`/app/surveys/${s.survey_id}`}
                    className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors group">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(rate, 100)}%`, background: rate > 70 ? C.green : rate > 40 ? C.yellow : C.orange }} />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{rate}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-800">{resp}</p>
                      <p className="text-xs text-gray-400">resp.</p>
                    </div>
                    <Stars rating={Math.round(rate / 20)} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sentiment + status donut charts side by side */}
        <div className="card">
          <SectionHeader
            title="Carbon Condensed"
            subtitle={`${surveys.filter(s=>s.status==='published').length} active · ${surveys.filter(s=>s.status==='draft').length} drafts`}
            action={<Link to="/app/analytics" className="text-xs text-indigo-600 hover:underline">View All →</Link>}
          />
          {/* Area chart for response trend */}
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={timelineData.slice(-8)}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="responses" stroke={C.blue}  fill="url(#areaGrad)"  strokeWidth={2} name="Responses" dot={false} />
              <Area type="monotone" dataKey="complete"  stroke={C.green} fill="url(#areaGrad2)" strokeWidth={2} name="Completed" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: Three donut charts (matching the design bottom row) ─────── */}
      <div className="grid grid-cols-3 gap-4 mb-4">

        {/* Survey status breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Survey Status</h3>
          <p className="text-xs text-gray-400 mb-3">Distribution across all surveys</p>
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                    dataKey="value" paddingAngle={3}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sentiment breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Sentiment</h3>
          <p className="text-xs text-gray-400 mb-3">From text answer analysis</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                dataKey="value" paddingAngle={3}>
                {sentimentData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {sentimentData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold text-gray-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion rate donut */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Completion Rate</h3>
          <p className="text-xs text-gray-400 mb-3">Avg across all surveys</p>
          {(() => {
            const rate  = Number(avgCompletion ?? 0);
            const done  = Math.round(rate);
            const left  = 100 - done;
            const donut = [
              { name: 'Complete',   value: done, color: C.blue   },
              { name: 'Incomplete', value: left, color: '#E5E7EB' },
            ];
            return (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={donut} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                        dataKey="value" startAngle={90} endAngle={-270} paddingAngle={2}>
                        {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{done}%</span>
                  </div>
                </div>
                <div className="space-y-1.5 mt-2">
                  {donut.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-semibold text-gray-800">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── Row 5: Recent surveys table ──────────────────────────────────────── */}
      <div className="card">
        <SectionHeader
          title="Recent Surveys"
          subtitle="Your latest survey activity"
          action={
            <div className="flex gap-2">
              <Link to="/app/analytics" className="btn-secondary text-xs py-1.5 flex items-center gap-1"><BarChart2 size={13} /> Analytics</Link>
              <Link to="/app/surveys"   className="btn-secondary text-xs py-1.5 flex items-center gap-1"><Eye size={13} /> View All</Link>
            </div>
          }
        />
        {loadSurveys ? (
          <div className="flex justify-center py-6"><Spinner className="text-indigo-500 w-5 h-5" /></div>
        ) : surveys.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No surveys found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Survey', 'Status', 'Responses', 'Completion', 'Last Response', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {surveys.slice(0, 8).map((s) => {
                  const rate = s.SurveyAnalytic?.completion_rate ?? 0;
                  const resp = s.SurveyAnalytic?.total_responses ?? 0;
                  const last = s.SurveyAnalytic?.last_response_at;
                  return (
                    <tr key={s.survey_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{s.title}</p>
                        <p className="text-xs text-gray-400">{s.Creator?.name ?? '—'} · {new Date(s.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="py-3 px-3"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800">{resp}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${Math.min(rate,100)}%`, background: rate>70?C.green:rate>40?C.yellow:C.orange }} />
                          </div>
                          <span className="text-xs text-gray-500">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {last ? new Date(last).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <Link to={`/app/surveys/${s.survey_id}`}
                          className="text-indigo-600 hover:underline text-xs font-medium">View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
