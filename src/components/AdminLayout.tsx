import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ExternalLink,
  LogOut,
  ArrowRight,
  Menu,
  X,
  Store,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminTenantProvider, useAdminTenant } from '../lib/AdminTenantContext';
import { useTheme } from '../lib/ThemeContext';

function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tenant, loading, claimTenant, getStorefrontUrl } = useAdminTenant();
  const { theme, toggleTheme } = useTheme();

  const [newHandle, setNewHandle] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Catalog & Markups', path: '/products', icon: Package },
    { label: 'Orders & Inquiries', path: '/orders', icon: ShoppingBag },
    { label: 'Customize Store', path: '/customize', icon: Palette },
    { label: 'Store Settings', path: '/settings', icon: Settings },
  ];


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;
    setIsClaiming(true);
    setClaimError(null);

    const res = await claimTenant(newHandle.trim());
    if (res.success) {
      setNewHandle('');
    } else {
      setClaimError(res.error || 'Failed to connect boutique');
    }
    setIsClaiming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0d10] flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
          <span className="font-normal text-base tracking-wide">Loading Weave365 portal...</span>
        </div>
      </div>
    );
  }

  // If this account does not have a boutique store assigned yet
  if (!tenant) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0d10] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#13151b] border border-zinc-200 dark:border-white/[0.08] rounded-2xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-zinc-700 dark:text-zinc-200 mx-auto mb-5">
            <Store size={24} />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Set Up Your Boutique Store</h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
            Enter your boutique handle to link your single store on Weave365.
          </p>

          {claimError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-base text-left">
              {claimError}
            </div>
          )}

          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <input
              type="text"
              required
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="e.g. radhika-sarees or varanasi-silk"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.1] rounded-xl text-zinc-900 dark:text-zinc-100 text-base font-mono placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isClaiming}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-base tracking-wide rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isClaiming ? 'Connecting...' : 'Launch Boutique Workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="text-base text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center space-x-2 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="text-base text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const storefrontUrl = getStorefrontUrl();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111216] border-b border-zinc-200 dark:border-white/[0.07] sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/20 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 text-sm">
            {tenant.store_name?.[0] || 'W'}
          </div>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate max-w-[170px] block">
            {tenant.store_name}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#111216] border-r border-zinc-200 dark:border-white/[0.07] flex flex-col justify-between p-4 transition-transform duration-200 md:static md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="space-y-6">
          {/* Weave365 Reseller Brand Badge */}
          <div className="px-2 pt-1 pb-4 border-b border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-base shadow-sm">
                W
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Weave365 <span className="text-amber-600 dark:text-amber-400 font-normal">Reseller</span>
              </span>
            </div>
          </div>

          {/* Boutique Store Identity (Static, Clean) */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-zinc-100/80 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.07]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-base shrink-0">
              {tenant.store_name?.[0] || 'B'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{tenant.store_name}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">@{tenant.slug}</div>
            </div>
          </div>

          {/* Quick Action: Open Storefront */}
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open storefront in new tab"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            <span>Live Store</span>
            <ExternalLink size={15} className="text-zinc-500 dark:text-zinc-400" />
          </a>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-200/70 dark:bg-white/[0.08] text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-400'} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: Theme Toggle & Sign Out */}
        <div className="pt-5 border-t border-zinc-200 dark:border-white/[0.06] space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-300">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-zinc-50 dark:bg-[#0c0d10] p-5 sm:p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminLayout() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0d10] flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
          <span className="font-normal text-base tracking-wide">Authenticating session...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminTenantProvider user={user}>
      <AdminShell />
    </AdminTenantProvider>
  );
}
