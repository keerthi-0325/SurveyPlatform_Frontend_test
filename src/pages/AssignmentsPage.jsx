import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, ClipboardList } from 'lucide-react';
import { assignmentsApi, surveysApi, clientsApi } from '../services/api';
import { PageHeader, StatusBadge, EmptyState, Modal, Spinner, Table } from '../components/ui';

export default function AssignmentsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: assignments = [], isLoading } = useQuery({ queryKey: ['assignments'], queryFn: assignmentsApi.getAll });
  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: surveysApi.getAll });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll });

  const createMutation = useMutation({
    mutationFn: (data) => assignmentsApi.create({
      survey_id: data.survey_id,
      client_ids: [data.client_id],
      reminder_dates: data.reminder_date ? [data.reminder_date] : [],
      due_date: data.due_date || null,
      priority: data.priority,
      notes: data.notes,
      notify_email: data.notify_email === 'true' || data.notify_email === true,
      notify_sms: data.notify_sms === 'true' || data.notify_sms === true,
    }),
    onSuccess: () => { qc.invalidateQueries(['assignments']); setShowModal(false); reset(); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => assignmentsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries(['assignments']),
  });

  const columns = [
    { key: 'survey',    label: 'Survey',   render: (r) => <span className="font-medium">{r.Survey?.title}</span> },
    { key: 'client',    label: 'Client',   render: (r) => r.Client?.name },
    { key: 'company',   label: 'Company',  render: (r) => r.Client?.company_name || '—' },
    { key: 'priority',  label: 'Priority', render: (r) => (
      <span className={`badge ${r.priority === 'high' ? 'bg-red-100 text-red-700' : r.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
        {r.priority || 'medium'}
      </span>
    )},
    { key: 'due_date',  label: 'Due Date', render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString() : '—' },
    { key: 'assigned',  label: 'Assigned', render: (r) => new Date(r.assigned_at).toLocaleDateString() },
    { key: 'status',    label: 'Status',   render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions',   label: 'Update',   render: (r) => (
      <select className="input py-1 text-xs w-36" value={r.status}
        onChange={(e) => statusMutation.mutate({ id: r.assignment_id, status: e.target.value })}
        onClick={(e) => e.stopPropagation()}>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="expired">Expired</option>
      </select>
    )},
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Assignments"
        subtitle="Track which clients have been assigned which surveys"
        action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Assign Survey</button>}
      />

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner className="text-indigo-600 w-6 h-6" /></div>
        ) : assignments.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assignments yet" description="Assign a survey to a client to get started."
            action={<button onClick={() => setShowModal(true)} className="btn-primary">Assign Survey</button>} />
        ) : (
          <Table columns={columns} data={assignments.map((a) => ({ ...a, id: a.assignment_id }))} />
        )}
      </div>

      <Modal isOpen={showModal} title="Assign Survey to Client" onClose={() => { setShowModal(false); reset(); }}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">

          <div>
            <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Assignment Details</h4>
            <div className="space-y-3">
              <div>
                <label className="label">Survey *</label>
                <select className="input" {...register('survey_id', { required: true })}>
                  <option value="">Select survey…</option>
                  {surveys.filter((s) => s.status === 'published').map((s) => (
                    <option key={s.survey_id} value={s.survey_id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Client *</label>
                <select className="input" {...register('client_id', { required: true })}>
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.client_id} value={c.client_id}>{c.name} — {c.company_name || c.email}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Scheduling</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Due Date</label>
                <input type="datetime-local" className="input" {...register('due_date')} />
              </div>
              <div>
                <label className="label">Reminder Date</label>
                <input type="datetime-local" className="input" {...register('reminder_date')} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Options</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Priority</label>
                <select className="input" {...register('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 mt-5">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" defaultChecked {...register('notify_email')} /> Notify by Email
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" {...register('notify_sms')} /> Notify by SMS
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Internal Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Any notes about this assignment…" {...register('notes')} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2">
              {createMutation.isPending && <Spinner size={14} />} Assign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
