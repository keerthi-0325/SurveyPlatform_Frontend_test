import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    draft:     'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    closed:    'bg-red-100 text-red-700',
    pending:   'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    expired:   'bg-red-100 text-red-600',
    sent:      'bg-green-100 text-green-700',
    failed:    'bg-red-100 text-red-700',
    read:      'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`badge ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-gray-300 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="btn-danger flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Deleting…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
