import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown, FileText, Table, Database, Loader2, CheckCircle } from 'lucide-react';
import { surveysApi } from '../services/api';
import { PageHeader, Spinner } from '../components/ui';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ExportCard({ icon: Icon, color, title, description, formats, onExport, loading }) {
  return (
    <div className="card">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {formats.map((fmt) => (
          <button
            key={fmt.label}
            disabled={!!loading}
            onClick={() => onExport(fmt.key)}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            {loading === fmt.key
              ? <Loader2 size={14} className="animate-spin text-indigo-500" />
              : <FileDown size={14} />}
            {loading === fmt.key ? 'Downloading…' : fmt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExportPage() {
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [loading, setLoading]               = useState(null);
  const [lastExport, setLastExport]         = useState(null);

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys'], queryFn: surveysApi.getAll,
  });

  const selectedTitle = surveys.find((s) => s.survey_id === selectedSurvey)?.title ?? '';

  const handle = async (type, fetchFn, filename) => {
    setLoading(type);
    try {
      const blob = await fetchFn();
      downloadBlob(blob, filename);
      setLastExport({ filename, time: new Date().toLocaleTimeString() });
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const safeName = selectedTitle.replace(/\s+/g, '-') || 'survey';

  return (
    <div className="p-8 max-w-4xl">
      <PageHeader
        title="Export Data"
        subtitle="Download survey responses and summaries in CSV, Excel or PDF format"
      />

      {/* All-surveys export */}
      <div className="card mb-6 bg-indigo-50 border border-indigo-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Export All Surveys</p>
              <p className="text-sm text-indigo-600">Summary report of every survey in your organisation</p>
            </div>
          </div>
          <button
            disabled={!!loading}
            onClick={() => handle('all-csv', surveysApi.exportAllCSV, 'all-surveys.csv')}
            className="btn-primary flex items-center gap-2"
          >
            {loading === 'all-csv'
              ? <Loader2 size={15} className="animate-spin" />
              : <FileDown size={15} />}
            {loading === 'all-csv' ? 'Downloading…' : 'Download CSV'}
          </button>
        </div>
      </div>

      {/* Survey-specific exports */}
      <div className="card mb-6">
        <label className="label">Select Survey for Detailed Export</label>
        {isLoading ? <Spinner className="text-indigo-500 w-4 h-4" /> : (
          <select className="input max-w-lg" value={selectedSurvey} onChange={(e) => setSelectedSurvey(e.target.value)}>
            <option value="">Choose a survey…</option>
            {surveys.map((s) => (
              <option key={s.survey_id} value={s.survey_id}>{s.title}</option>
            ))}
          </select>
        )}
      </div>

      {selectedSurvey && (
        <div className="space-y-4">
          <ExportCard
            icon={Table} color="bg-green-500"
            title="CSV Export"
            description="Plain CSV — one row per response, one column per question. Compatible with Excel, Google Sheets, and any data tool."
            formats={[{ key: 'csv', label: 'Download CSV' }]}
            loading={loading}
            onExport={() => handle('csv', () => surveysApi.exportCSV(selectedSurvey), `${safeName}-responses.csv`)}
          />
          <ExportCard
            icon={FileText} color="bg-blue-500"
            title="Excel Export (.xlsx)"
            description="Formatted Excel workbook with 3 sheets: Responses (colour-coded sentiment), Summary stats, and Channel breakdown."
            formats={[{ key: 'excel', label: 'Download Excel' }]}
            loading={loading}
            onExport={() => handle('excel', () => surveysApi.exportExcel(selectedSurvey), `${safeName}-responses.xlsx`)}
          />
          <ExportCard
            icon={FileDown} color="bg-indigo-500"
            title="PDF Export"
            description="Branded PDF report with cover page, analytics, per-question breakdown, and individual responses."
            formats={[
              { key: 'pdf-report', label: 'Full Report PDF' },
              { key: 'pdf-form',   label: 'Blank Form PDF'  },
            ]}
            loading={loading}
            onExport={(key) => {
              const type = key === 'pdf-form' ? 'form' : 'report';
              handle(key, () => surveysApi.exportPDF(selectedSurvey, type), `${safeName}-${type}.pdf`);
            }}
          />
        </div>
      )}

      {lastExport && (
        <div className="mt-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle size={16} />
          <span><strong>{lastExport.filename}</strong> downloaded successfully at {lastExport.time}</span>
        </div>
      )}
    </div>
  );
}
