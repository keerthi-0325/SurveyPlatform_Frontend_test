import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Trash2, Users } from 'lucide-react';
import { clientsApi } from '../services/api';
import { PageHeader, EmptyState, ConfirmDialog, Modal, Table, Spinner, StatusBadge } from '../components/ui';

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: clients = [], isLoading } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll });

  const createMutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => { qc.invalidateQueries(['clients']); setShowModal(false); reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => { qc.invalidateQueries(['clients']); setDeleteTarget(null); },
  });

  const filtered = clients.filter((c) =>
    `${c.name} ${c.email} ${c.company_name} ${c.phone} ${c.city} ${c.country}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name',         label: 'Name',    render: (row) => <Link to={`/app/clients/${row.client_id}`} className="text-indigo-600 hover:underline font-medium">{row.name}</Link> },
    { key: 'email',        label: 'Email' },
    { key: 'phone',        label: 'Phone' },
    { key: 'company_name', label: 'Company' },
    { key: 'job_title',    label: 'Job Title' },
    { key: 'city',         label: 'City' },
    { key: 'country',      label: 'Country' },
    { key: 'status',       label: 'Status', render: (row) => <StatusBadge status={row.status || 'active'} /> },
    { key: 'tags',         label: 'Tags', render: (row) => (
      <div className="flex gap-1 flex-wrap">
        {row.Tags?.map((t) => (
          <span key={t.tag_id} className="badge bg-indigo-50 text-indigo-700" style={{ borderLeft: `3px solid ${t.color || '#6366f1'}` }}>{t.tag_name}</span>
        ))}
      </div>
    )},
    { key: 'actions', label: '', render: (row) => (
      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row.client_id); }} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
        <Trash2 size={15} />
      </button>
    )},
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} registered client${clients.length !== 1 ? 's' : ''}`}
        action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Client</button>}
      />

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9 max-w-xs" placeholder="Search by name, email, company, city…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner className="text-indigo-600 w-6 h-6" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No clients found" description="Add your first client to start sending surveys."
            action={<button onClick={() => setShowModal(true)} className="btn-primary">Add Client</button>} />
        ) : (
          <Table columns={columns} data={filtered.map((c) => ({ ...c, id: c.client_id }))} />
        )}
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={showModal} title="Add New Client" onClose={() => { setShowModal(false); reset(); }}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-5">

          {/* Personal Info */}
          <div>
            <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Personal Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input className="input" placeholder="John Smith" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="john@company.com" {...register('email')} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="+91 98765 43210" {...register('phone')} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" {...register('gender')}>
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" className="input" {...register('date_of_birth')} />
              </div>
              <div>
                <label className="label">Preferred Language</label>
                <select className="input" {...register('preferred_lang')}>
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="hi">Hindi</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Professional Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Company Name</label>
                <input className="input" placeholder="Acme Corp" {...register('company_name')} />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input className="input" placeholder="Senior Manager" {...register('job_title')} />
              </div>
              <div>
                <label className="label">Department</label>
                <input className="input" placeholder="Operations" {...register('department')} />
              </div>
              <div>
                <label className="label">Industry</label>
                <select className="input" {...register('industry')}>
                  <option value="">Select…</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input" placeholder="https://acme.com" {...register('website')} />
              </div>
              <div>
                <label className="label">LinkedIn URL</label>
                <input className="input" placeholder="https://linkedin.com/in/..." {...register('linkedin_url')} />
              </div>
              <div>
                <label className="label">Source / Lead Origin</label>
                <select className="input" {...register('source')}>
                  <option value="">Select…</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Location</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="Chennai" {...register('city')} />
              </div>
              <div>
                <label className="label">Country</label>
                <input className="input" placeholder="India" {...register('country')} />
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <textarea className="input resize-none" rows={2} placeholder="Street address…" {...register('address')} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Internal Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Any notes about this client…" {...register('notes')} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2">
              {createMutation.isPending && <Spinner size={14} />} Add Client
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Client"
        message="This will permanently delete the client and all their data. This cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
