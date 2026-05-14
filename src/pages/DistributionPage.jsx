import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mail, MessageCircle, QrCode, MapPin, Download, Copy, Check, Send, Loader2 } from 'lucide-react';
import { surveysApi, distributionApi, clientsApi } from '../services/api';
import { PageHeader, Spinner } from '../components/ui';

function downloadBlob(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
}

// ─── Channel QR Card ──────────────────────────────────────────────────────────
function ChannelCard({ name, icon: Icon, color, link, qr, onCopy, copied }) {
  const [showQr, setShowQr] = useState(false);
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">{name}</h3>
      </div>
      <div className="flex gap-2 mb-3">
        <input readOnly className="input text-xs text-gray-500 flex-1 min-w-0" value={link} />
        <button onClick={() => onCopy(link)} className="btn-secondary flex items-center gap-1 text-xs shrink-0">
          {copied === link ? <><Check size={12} className="text-green-600" />Copied</> : <><Copy size={12} />Copy</>}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShowQr((v) => !v)} className="btn-secondary text-xs flex items-center gap-1">
          <QrCode size={12} /> {showQr ? 'Hide QR' : 'Show QR'}
        </button>
        {qr && (
          <button onClick={() => downloadBlob(qr, `${name.toLowerCase().replace(/\s+/g,'-')}-qr.png`)}
            className="btn-secondary text-xs flex items-center gap-1">
            <Download size={12} /> Download QR
          </button>
        )}
      </div>
      {showQr && qr && (
        <div className="mt-4 flex justify-center">
          <img src={qr} alt={`${name} QR`} className="w-36 h-36 rounded-xl shadow border border-gray-100" />
        </div>
      )}
    </div>
  );
}

export default function DistributionPage() {
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [copied, setCopied]                 = useState('');
  const [activeTab, setActiveTab]           = useState('links');
  const [emailMsg, setEmailMsg]             = useState('');
  const [waMsg, setWaMsg]                   = useState('');
  const [venueName, setVenueName]           = useState('');
  const [venueLocation, setVenueLocation]   = useState('');
  const [venueQR, setVenueQR]               = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [toast, setToast]                   = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: surveysApi.getAll });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll });

  const { data: links, isLoading: loadingLinks } = useQuery({
    queryKey: ['dist-links', selectedSurvey],
    queryFn:  () => distributionApi.getLinks(selectedSurvey),
    enabled:  !!selectedSurvey,
    staleTime: Infinity,
  });

  const { data: stats } = useQuery({
    queryKey: ['dist-stats', selectedSurvey],
    queryFn:  () => distributionApi.getStats(selectedSurvey),
    enabled:  !!selectedSurvey && activeTab === 'stats',
    staleTime: 30_000,
  });

  const emailMutation = useMutation({
    mutationFn: (data) => distributionApi.sendEmail(selectedSurvey, data),
    onSuccess: (r) => showToast(`Email logged for ${r.count} client(s)`),
    onError: () => showToast('Failed to log email distribution', 'error'),
  });

  const waMutation = useMutation({
    mutationFn: (data) => distributionApi.sendWhatsApp(selectedSurvey, data),
    onSuccess: (r) => {
      showToast(`WhatsApp logged for ${r.count} client(s)`);
      window.open(r.wa_link, '_blank');
    },
    onError: () => showToast('Failed to log WhatsApp distribution', 'error'),
  });

  const venueMutation = useMutation({
    mutationFn: (data) => distributionApi.generateVenueQR(selectedSurvey, data),
    onSuccess: (r) => { setVenueQR(r); showToast('Venue QR generated!'); },
    onError: () => showToast('Failed to generate venue QR', 'error'),
  });

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(''), 2000);
  };

  const toggleClient = (id) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const CHANNEL_CONFIG = [
    { key: 'qr',       name: 'QR Code',   icon: QrCode,         color: 'bg-indigo-500' },
    { key: 'email',    name: 'Email',      icon: Mail,           color: 'bg-blue-500'   },
    { key: 'whatsapp', name: 'WhatsApp',   icon: MessageCircle,  color: 'bg-green-500'  },
    { key: 'link',     name: 'Direct Link',icon: Copy,           color: 'bg-gray-500'   },
    { key: 'venue',    name: 'Venue',      icon: MapPin,         color: 'bg-orange-500' },
    { key: 'sms',      name: 'SMS',        icon: Send,           color: 'bg-purple-500' },
  ];

  const TABS = [
    { id: 'links',    label: 'Channel Links' },
    { id: 'email',    label: 'Email' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'venue',    label: 'Venue QR' },
    { id: 'stats',    label: 'Status' },
  ];

  return (
    <div className="p-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
        </div>
      )}

      <PageHeader title="Distribution" subtitle="Send surveys via email, WhatsApp, QR code, venue or direct link" />

      {/* Survey picker */}
      <div className="card mb-6">
        <label className="label">Select Survey</label>
        <select className="input max-w-lg" value={selectedSurvey} onChange={(e) => { setSelectedSurvey(e.target.value); setVenueQR(null); }}>
          <option value="">Choose a published survey…</option>
          {surveys.filter((s) => s.status === 'published').map((s) => (
            <option key={s.survey_id} value={s.survey_id}>{s.title}</option>
          ))}
        </select>
        {surveys.some((s) => s.status !== 'published' && s.status !== 'archived') && (
          <p className="text-xs text-amber-600 mt-1">Only published surveys can be distributed. Unpublished surveys are hidden.</p>
        )}
      </div>

      {!selectedSurvey && (
        <div className="card text-center py-16 text-gray-400">
          <Send size={48} className="mx-auto mb-4 opacity-20" />
          <p>Select a published survey to manage distribution</p>
        </div>
      )}

      {selectedSurvey && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Channel Links ─────────────────────────────────────────────── */}
          {activeTab === 'links' && (
            loadingLinks
              ? <div className="flex justify-center py-12"><Spinner className="text-indigo-600 w-6 h-6" /></div>
              : links?.links ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {CHANNEL_CONFIG.map(({ key, name, icon, color }) =>
                    links.links[key] ? (
                      <ChannelCard
                        key={key} name={name} icon={icon} color={color}
                        link={links.links[key].url} qr={links.links[key].qr}
                        onCopy={copyLink} copied={copied}
                      />
                    ) : null
                  )}
                </div>
              ) : (
                <div className="card text-center py-10 text-gray-400">Could not load links.</div>
              )
          )}

          {/* ── Email ─────────────────────────────────────────────────────── */}
          {activeTab === 'email' && (
            <div className="card max-w-2xl space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Mail size={16} className="text-blue-500" /> Email Distribution</h2>
              <div>
                <label className="label">Select Clients</label>
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                  {clients.map((c) => (
                    <label key={c.client_id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={selectedClients.includes(c.client_id)} onChange={() => toggleClient(c.client_id)} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email || '—'}</p>
                      </div>
                    </label>
                  ))}
                  {!clients.length && <p className="text-sm text-gray-400 p-4 text-center">No clients found.</p>}
                </div>
                <p className="text-xs text-gray-400 mt-1">{selectedClients.length} client(s) selected</p>
              </div>
              <div>
                <label className="label">Custom Message (optional)</label>
                <textarea className="input resize-none" rows={3} placeholder="Leave blank to use the default invitation message…"
                  value={emailMsg} onChange={(e) => setEmailMsg(e.target.value)} />
              </div>
              <button
                disabled={emailMutation.isPending || !selectedClients.length}
                onClick={() => emailMutation.mutate({ client_ids: selectedClients, message: emailMsg || undefined })}
                className="btn-primary flex items-center gap-2"
              >
                {emailMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                {emailMutation.isPending ? 'Logging…' : `Log Email for ${selectedClients.length} Client(s)`}
              </button>
              <p className="text-xs text-gray-400">This logs the distribution. Integrate with SendGrid/Mailgun/SMTP to send actual emails.</p>
            </div>
          )}

          {/* ── WhatsApp ──────────────────────────────────────────────────── */}
          {activeTab === 'whatsapp' && (
            <div className="card max-w-2xl space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><MessageCircle size={16} className="text-green-500" /> WhatsApp Distribution</h2>
              <div>
                <label className="label">Select Clients</label>
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                  {clients.map((c) => (
                    <label key={c.client_id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={selectedClients.includes(c.client_id)} onChange={() => toggleClient(c.client_id)} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.phone || 'No phone'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input resize-none" rows={3} placeholder="Hi! Please fill out our survey…"
                  value={waMsg} onChange={(e) => setWaMsg(e.target.value)} />
              </div>
              <button
                disabled={waMutation.isPending}
                onClick={() => waMutation.mutate({ client_ids: selectedClients, message: waMsg || undefined })}
                className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {waMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
                {waMutation.isPending ? 'Opening…' : 'Open WhatsApp'}
              </button>
              <p className="text-xs text-gray-400">Opens WhatsApp Web with the survey link pre-filled. Distribution is logged for analytics.</p>
            </div>
          )}

          {/* ── Venue QR ──────────────────────────────────────────────────── */}
          {activeTab === 'venue' && (
            <div className="card max-w-xl space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> Venue QR Code</h2>
              <p className="text-sm text-gray-500">Generate a venue-specific QR code to print and display at physical locations.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Venue Name *</label>
                  <input className="input" placeholder="e.g. Main Hall" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" placeholder="e.g. Chennai, IN" value={venueLocation} onChange={(e) => setVenueLocation(e.target.value)} />
                </div>
              </div>
              <button
                disabled={venueMutation.isPending || !venueName}
                onClick={() => venueMutation.mutate({ venue_name: venueName, venue_location: venueLocation })}
                className="btn-primary flex items-center gap-2"
              >
                {venueMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
                Generate Venue QR
              </button>

              {venueQR && (
                <div className="mt-4 flex flex-col items-center gap-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">{venueQR.venue_name}</p>
                  <img src={venueQR.qr_png} alt="Venue QR" className="w-52 h-52 rounded-xl shadow-md border border-gray-100" />
                  <div className="flex gap-2">
                    <button onClick={() => downloadBlob(venueQR.qr_png, `${venueName}-qr.png`)}
                      className="btn-secondary flex items-center gap-1.5 text-xs">
                      <Download size={13} /> PNG
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([venueQR.qr_svg], { type: 'image/svg+xml' });
                        downloadBlob(URL.createObjectURL(blob), `${venueName}-qr.svg`);
                      }}
                      className="btn-secondary flex items-center gap-1.5 text-xs">
                      <Download size={13} /> SVG
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Stats ─────────────────────────────────────────────────────── */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {!stats ? (
                <div className="flex justify-center py-12"><Spinner className="text-indigo-600 w-6 h-6" /></div>
              ) : (
                <>
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-3">Responses by Channel</h3>
                    {!stats.responses_by_channel.length ? (
                      <p className="text-sm text-gray-400">No responses yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {['Channel','Responses','Completed','Completion Rate','Avg Time'].map((h) => (
                              <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {stats.responses_by_channel.map((r) => (
                            <tr key={r.channel} className="hover:bg-gray-50">
                              <td className="py-2 px-3 font-medium capitalize">{r.channel}</td>
                              <td className="py-2 px-3">{r.responses}</td>
                              <td className="py-2 px-3 text-green-700">{r.completed}</td>
                              <td className="py-2 px-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  r.responses > 0 && ((r.completed/r.responses)*100) >= 70
                                    ? 'bg-green-100 text-green-700'
                                    : r.responses > 0 && ((r.completed/r.responses)*100) >= 40
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {r.responses > 0 ? `${Math.round((r.completed/r.responses)*100)}%` : '—'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-500">{r.avg_time ? `${Math.round(r.avg_time)}s` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-3">Notifications Sent</h3>
                    {!stats.notifications_by_channel.length ? (
                      <p className="text-sm text-gray-400">No notifications logged yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {['Type','Sent','Read'].map((h) => (
                              <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {stats.notifications_by_channel.map((n) => (
                            <tr key={n.type} className="hover:bg-gray-50">
                              <td className="py-2 px-3 font-medium capitalize">{n.type}</td>
                              <td className="py-2 px-3">{n.sent}</td>
                              <td className="py-2 px-3 text-indigo-600">{n.read_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
