import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Eye, Edit, FileText } from 'lucide-react';
import { surveysApi } from '../services/api';
import { PageHeader, StatusBadge, EmptyState, ConfirmDialog, Spinner } from '../components/ui';

export default function SurveysPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: surveysApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: surveysApi.delete,
  });

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['surveys'] });
        setDeleteTarget(null);
        setDeleteError(null);
      },
      onError: (err) => {
        setDeleteTarget(null);
        setDeleteError(err?.response?.data?.error || 'Delete failed. You may not have permission.');
      },
    });
  };

  const filtered = surveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Surveys"
        subtitle={`${surveys.length} total survey${surveys.length !== 1 ? 's' : ''}`}
        action={
          <Link to="/app/surveys/new" className="btn-primary flex items-center gap-2 touch-manipulation">
            <Plus size={16} /> New Survey
          </Link>
        }
      />

      {/* Search — full width on mobile */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 w-full sm:max-w-xs"
          placeholder="Search surveys…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="text-indigo-600 w-6 h-6" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No surveys found"
          description={search ? 'Try a different search term.' : 'Create your first survey to get started.'}
          action={!search && <Link to="/app/surveys/new" className="btn-primary touch-manipulation">Create Survey</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.survey_id} className="card hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={s.status} />
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/app/surveys/${s.survey_id}/edit`)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors touch-manipulation"
                  ><Edit size={15} /></button>
                  <button
                    onClick={() => setDeleteTarget(s.survey_id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                  ><Trash2 size={15} /></button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{s.title}</h3>
              {s.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>}

              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>By {s.Creator?.name}</span>
                <span>{new Date(s.created_at).toLocaleDateString()}</span>
              </div>

              <Link to={`/app/surveys/${s.survey_id}`} className="btn-secondary text-center mt-3 flex items-center justify-center gap-1 text-sm py-2.5 touch-manipulation">
                <Eye size={14} /> View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {deleteError && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-sm">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 font-bold leading-none flex-shrink-0">&times;</button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Survey"
        message="This will permanently delete the survey and all its responses. This cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleteMutation.isPending && setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
