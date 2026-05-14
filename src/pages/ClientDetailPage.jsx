import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, Building2, ClipboardList } from 'lucide-react';
import { clientsApi } from '../services/api';
import { PageHeader, StatusBadge, Spinner } from '../components/ui';

export default function ClientDetailPage() {
  const { id } = useParams();
  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getOne(id),
  });

  if (isLoading) return <div className="flex justify-center p-16"><Spinner className="text-indigo-600 w-6 h-6" /></div>;
  if (!client) return <div className="p-8 text-gray-500">Client not found.</div>;

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader title={client.name} subtitle={client.company_name || 'No company'} />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-900">Contact Info</h3>
          {client.email && <p className="flex items-center gap-2 text-sm text-gray-600"><Mail size={15} className="text-gray-400" />{client.email}</p>}
          {client.phone && <p className="flex items-center gap-2 text-sm text-gray-600"><Phone size={15} className="text-gray-400" />{client.phone}</p>}
          {client.company_name && <p className="flex items-center gap-2 text-sm text-gray-600"><Building2 size={15} className="text-gray-400" />{client.company_name}</p>}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
          <div className="flex gap-2 flex-wrap">
            {client.Tags?.length ? client.Tags.map((t) => (
              <span key={t.tag_id} className="badge bg-indigo-50 text-indigo-700">{t.tag_name}</span>
            )) : <p className="text-sm text-gray-400">No tags</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList size={16} /> Survey Assignments ({client.SurveyAssignments?.length || 0})
        </h3>
        {client.SurveyAssignments?.length === 0 ? (
          <p className="text-sm text-gray-500">No surveys assigned yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {client.SurveyAssignments?.map((a) => (
              <div key={a.assignment_id} className="py-3 flex items-center justify-between">
                <div>
                  <Link to={`/app/surveys/${a.survey_id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                    {a.Survey?.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">Assigned {new Date(a.assigned_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
