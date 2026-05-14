import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Edit, BarChart2, Copy, Check, QrCode, Download,
  Users, FileText, RefreshCw, FileDown, Loader2,
} from 'lucide-react';
import { surveysApi } from '../services/api';
import { PageHeader, StatusBadge, Spinner } from '../components/ui';

// ─── PDF download helper ──────────────────────────────────────────────────────
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── PDF Export Button ────────────────────────────────────────────────────────
function PDFExportButton({ surveyId, surveyTitle }) {
  const [loading, setLoading] = useState(null); // 'report' | 'form' | null

  const handleExport = async (type) => {
    setLoading(type);
    try {
      const blob = await surveysApi.exportPDF(surveyId, type);
      const label = type === 'report' ? 'Response-Report' : 'Blank-Form';
      downloadBlob(blob, `${surveyTitle.replace(/\s+/g, '-')}-${label}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative group">
      <button
        disabled={!!loading}
        className="btn-secondary flex items-center gap-1.5"
        onClick={() => handleExport('report')}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <FileDown size={14} />
        )}
        {loading === 'report' ? 'Generating…' : loading === 'form' ? 'Generating…' : 'Export PDF'}
      </button>

      {/* Dropdown on hover */}
      <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 hidden group-hover:block">
        <button
          disabled={!!loading}
          onClick={() => handleExport('report')}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-t-xl transition-colors"
        >
          {loading === 'report' ? <Loader2 size={15} className="animate-spin text-indigo-500" /> : <FileDown size={15} className="text-indigo-500" />}
          <div className="text-left">
            <p className="font-medium">Response Report</p>
            <p className="text-xs text-gray-400">All answers + analytics</p>
          </div>
        </button>
        <div className="border-t border-gray-100" />
        <button
          disabled={!!loading}
          onClick={() => handleExport('form')}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-b-xl transition-colors"
        >
          {loading === 'form' ? <Loader2 size={15} className="animate-spin text-indigo-500" /> : <FileText size={15} className="text-indigo-500" />}
          <div className="text-left">
            <p className="font-medium">Blank Form</p>
            <p className="text-xs text-gray-400">Printable questions only</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── QR Panel ─────────────────────────────────────────────────────────────────
function QRPanel({ surveyId, publicLink }) {
  const [show, setShow]     = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: qr, isLoading: qrLoading } = useQuery({
    queryKey:  ['qr', surveyId],
    queryFn:   () => surveysApi.getQRDataUrl(surveyId),
    enabled:   show,
    staleTime: Infinity,
  });

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qr?.dataUrl) return;
    downloadBlob(
      dataURLtoBlob(qr.dataUrl),
      `survey-${surveyId}-qr.png`
    );
  };

  return (
    <div className="card mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-3">Share Survey</p>
      <div className="flex gap-2 flex-wrap">
        <input readOnly className="input text-xs text-gray-500 flex-1 min-w-0" value={publicLink} />
        <button onClick={copyLink} className="btn-secondary flex items-center gap-1.5 shrink-0">
          {copied ? <><Check size={14} className="text-green-600" />Copied</> : <><Copy size={14} />Copy</>}
        </button>
        <button onClick={() => setShow((v) => !v)} className="btn-secondary flex items-center gap-1.5 shrink-0">
          <QrCode size={14} />
          {show ? 'Hide QR' : 'Show QR'}
        </button>
      </div>

      {show && (
        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col items-center gap-4">
          {qrLoading ? (
            <Spinner className="text-indigo-600 w-6 h-6" />
          ) : qr?.dataUrl ? (
            <>
              <img src={qr.dataUrl} alt="Survey QR Code"
                className="w-52 h-52 rounded-xl shadow-md border border-gray-100" />
              <p className="text-xs text-gray-400 text-center">Scan to open the survey</p>
              <div className="flex gap-2">
                <button onClick={downloadQR} className="btn-secondary flex items-center gap-1.5 text-xs">
                  <Download size={13} /> Download PNG
                </button>
                <a href={`${import.meta.env.VITE_API_URL}/surveys/${surveyId}/qr?format=svg`}
                  download={`survey-${surveyId}-qr.svg`}
                  className="btn-secondary flex items-center gap-1.5 text-xs">
                  <Download size={13} /> Download SVG
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Failed to load QR code.</p>
          )}
        </div>
      )}
    </div>
  );
}

// dataURL → Blob helper (for QR PNG download)
function dataURLtoBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ─── Responses Table ──────────────────────────────────────────────────────────
function ResponsesTable({ surveyId }) {
  const { data: responses = [], isLoading, refetch, isFetching } = useQuery({
    queryKey:        ['responses', surveyId],
    queryFn:         () => surveysApi.getResponses(surveyId),
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div className="flex justify-center py-8"><Spinner className="text-indigo-600 w-5 h-5" /></div>
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users size={17} className="text-indigo-500" />
          Responses ({responses.length})
        </h2>
        <button onClick={() => refetch()} disabled={isFetching}
          className="btn-secondary flex items-center gap-1.5 text-xs">
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Users size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No responses yet. Share the link or QR code above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['#', 'Submitted', 'Answers', 'IP', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {responses.map((r, i) => (
                <tr key={r.response_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 text-gray-500 font-mono text-xs">{i + 1}</td>
                  <td className="py-2.5 px-3 text-gray-700 text-xs">
                    {new Date(r.submitted_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      {r.Answers?.slice(0, 3).map((a) => (
                        <div key={a.answer_id} className="text-xs text-gray-600">
                          <span className="font-medium text-gray-700">
                            {a.Question?.question_text?.slice(0, 35)}:
                          </span>{' '}
                          <span className="text-gray-500">
                            {a.SelectedOption?.option_text
                              || a.value_text
                              || (a.value_number != null ? a.value_number : null)
                              || (a.value_json ? JSON.stringify(a.value_json) : '—')}
                          </span>
                        </div>
                      ))}
                      {r.Answers?.length > 3 && (
                        <p className="text-xs text-indigo-500">+{r.Answers.length - 3} more</p>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs font-mono">{r.ip_address || '—'}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={r.is_complete ? 'completed' : 'pending'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SurveyDetailPage() {
  const { id } = useParams();

  const { data: survey, isLoading } = useQuery({
    queryKey: ['surveys', id],
    queryFn:  () => surveysApi.getOne(id),
  });

  if (isLoading) return (
    <div className="flex justify-center p-16"><Spinner className="text-indigo-600 w-6 h-6" /></div>
  );
  if (!survey) return <div className="p-8 text-gray-500">Survey not found.</div>;

  const activeVersion = survey.SurveyVersions?.find((v) => v.is_active);
  const publicLink    = `${window.location.origin}/respond/${id}`;

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title={survey.title}
        subtitle={survey.description}
        action={
          <div className="flex gap-2 items-center">
            <Link to={`/app/surveys/${id}/edit`} className="btn-secondary flex items-center gap-2">
              <Edit size={15} /> Edit
            </Link>
            <Link to="/app/analytics" className="btn-secondary flex items-center gap-2">
              <BarChart2 size={15} /> Analytics
            </Link>
            {/* PDF Export — hover reveals dropdown with two options */}
            <PDFExportButton surveyId={id} surveyTitle={survey.title} />
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-indigo-600">{survey.SurveyAnalytic?.total_responses ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Responses</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-indigo-600">{activeVersion?.Questions?.length ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Questions</p>
        </div>
        <div className="card text-center">
          <StatusBadge status={survey.status} />
          <p className="text-sm text-gray-500 mt-1">Status</p>
        </div>
      </div>

      {/* QR + share (published only) */}
      {survey.status === 'published' && (
        <QRPanel surveyId={id} publicLink={publicLink} />
      )}

      {/* Questions list */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={17} className="text-indigo-500" />
          Questions — Version {activeVersion?.version_number ?? 1}
        </h2>
        {!activeVersion?.Questions?.length ? (
          <p className="text-gray-400 text-sm">
            No questions yet.{' '}
            <Link to={`/app/surveys/${id}/edit`} className="text-indigo-600 hover:underline">Add some.</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {activeVersion.Questions
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((q, i) => (
                <div key={q.question_id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-bold text-indigo-600 w-6 flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{q.question_text}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5">
                        {q.question_type}
                      </span>
                      {q.is_required && (
                        <span className="text-xs text-red-600 bg-red-50 rounded px-1.5 py-0.5">Required</span>
                      )}
                    </div>
                    {q.Options?.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {q.Options.map((o) => (
                          <li key={o.option_id} className="text-xs text-gray-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 inline-block flex-shrink-0" />
                            {o.option_text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Responses table */}
      <ResponsesTable surveyId={id} />
    </div>
  );
}
