import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, ClipboardList,
  BarChart2, UserCog, LogOut, Send, Download,
  TrendingUp, ChevronDown, ChevronRight, Menu, X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';

const NAV = [
  { to: '/app/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/app/surveys',     label: 'Surveys',      icon: FileText },
  { to: '/app/clients',     label: 'Clients',      icon: Users },
  { to: '/app/assignments', label: 'Assignments',  icon: ClipboardList },
  // Analytics group
  {
    label: 'Analytics',
    icon: BarChart2,
    group: true,
    children: [
      { to: '/app/analytics',           label: 'Overview',           icon: BarChart2 },
      { to: '/app/analytics/advanced',  label: 'Advanced Analytics', icon: TrendingUp },
    ],
  },
  { to: '/app/distribution', label: 'Distribution',  icon: Send },
  { to: '/app/export',       label: 'Export Data',   icon: Download },
  { to: '/app/users',        label: 'Users',          icon: UserCog, adminOnly: true },
];

function NavGroup({ item, user, onNavClick }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <item.icon size={18} />
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <child.icon size={15} />
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [navigate]);

  // Close sidebar when screen widens to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);
  const ROLE_COLORS = {
    admin:  'bg-red-100 text-red-700',
    staff:  'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">SurveyPro</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-10">Enterprise Platform</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            if (item.group) return <NavGroup key={item.label} item={item} user={user} onNavClick={() => setSidebarOpen(false)} />;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${ROLE_COLORS[user?.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">SurveyPro</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
