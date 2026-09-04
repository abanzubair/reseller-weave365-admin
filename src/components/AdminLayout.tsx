import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  ChevronDown,
  Plus,
  ArrowRight,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminTenantProvider, useAdminTenant } from '../lib/AdminTenantContext';

function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const { tenant, tenantsList, loading, switchTenant, claimTenant, getStorefrontUrl } = useAdminTenant();

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Catalog & Markups', path: '/products', icon: Package },
    { label: 'Orders & Inquiries', path: '/orders', icon: ShoppingBag },
    { label: 'Store Settings', path: '/settings', icon: Settings },
  ];

  const handleCopyStoreLink = () => {
    const url = getStorefrontUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('weave365_reseller_active_slug');
    navigate('/login');
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;
    setIsClaiming(true);
    setClaimError(null);

    const res = await claimTenant(newHandle.trim());
    if (res.success) {
      setClaimModalOpen(false);
      setNewHandle('');
    } else {
      setClaimError(res.error || 'Failed to connect boutique');
    }
    setIsClaiming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center text-zinc-400 text-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400/80 animate-ping" />
          <span className="font-normal text-xs tracking-wide">Loading Weave365 portal...</span>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#13151b] border border-white/[0.08] rounded-2xl p-8 text-center shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200 mx-auto mb-4">
            <Store size={20} />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Connect Boutique Store</h2>
          <p className="text-xs text-zinc-400 mt-1.5 mb-6 leading-relaxed">
            Enter your boutique handle to manage your saree catalog, wholesale profit markups, and customer orders.
          </p>

          {claimError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-left">
              {claimError}
            </div>
          )}

          <form onSubmit={handleClaimSubmit} className="space-y-3">
            <input
              type="text"
              required
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="e.g. radhika-sarees or 50k"
              className="w-full px-3.5 py-2.5 bg-[#090a0c] border border-white/[0.1] rounded-xl text-zinc-100 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
            <button
              type="submit"
              disabled={isClaiming}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-xs tracking-wide rounded-xl transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{isClaiming ? 'Connecting...' : 'Launch Reseller Workspace'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-400 hover:text-rose-400 transition-colors"
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
    <div className="min-h-screen bg-[#0c0d10] text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111216] border-b border-white/[0.07] sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center font-semibold text-amber-400 text-xs">
            {tenant.store_name?.[0] || 'W'}
          </div>
          <div>
            <span className="font-medium text-zinc-200 text-xs truncate max-w-[150px] block">
              {tenant.store_name}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">reseller.weave365.com</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-white/[0.04] transition-colors"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-[#111216] border-r border-white/[0.07] flex flex-col justify-between p-4 transition-transform duration-200 md:static md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="space-y-6">
          {/* Weave365 Reseller Brand Badge */}
          <div className="px-2 pt-1 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs">
                  W
                </div>
                <span className="text-xs font-semibold tracking-wide text-zinc-200">
                  Weave365 <span className="text-amber-400 font-normal">Reseller</span>
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-mono">
                v1.0
              </span>
            </div>
          </div>

          {/* Active Store Selector */}
          <div className="relative">
            <button
              onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] transition-colors text-left"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-medium text-zinc-200 text-xs shrink-0">
                  {tenant.store_name?.[0] || 'B'}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-xs text-zinc-100 truncate">{tenant.store_name}</div>
                  <div className="text-[11px] text-zinc-400 font-mono truncate">@{tenant.slug}</div>
                </div>
              </div>
              <ChevronDown size={14} className="text-zinc-400 shrink-0 ml-2" />
            </button>

            {/* Dropdown Menu */}
            {storeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-[#161820] border border-white/[0.09] rounded-xl shadow-2xl z-50">
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {tenantsList.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.slug);
                        setStoreDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        t.slug === tenant.slug
                          ? 'bg-amber-400/10 text-amber-300 font-medium'
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="truncate">{t.store_name}</span>
                      <span className="font-mono text-[10px] text-zinc-500">@{t.slug}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-1 pt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setStoreDropdownOpen(false);
                      setClaimModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/[0.04] transition-colors"
                  >
                    <Plus size={13} className="text-zinc-400" />
                    <span>Connect another store</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Strip: Copy Link & Open Storefront */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleCopyStoreLink}
              title="Copy public store link"
              className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-300 text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-zinc-400" />
                  <span className="text-[11px]">Copy Link</span>
                </>
              )}
            </button>

            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open storefront in new tab"
              className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-300 text-xs transition-colors"
            >
              <span className="text-[11px]">Live Store</span>
              <ExternalLink size={12} className="text-zinc-400" />
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.08] text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-amber-400' : 'text-zinc-500'} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Sign Out */}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Domain:</span>
              <span className="font-mono text-[10px] text-zinc-300">reseller.weave365.com</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#0c0d10] p-4 sm:p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Connect Store Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#13151b] border border-white/[0.09] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Connect Boutique Store</h3>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter another boutique handle registered on Weave365 to link and manage it from this portal.
            </p>

            {claimError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {claimError}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                placeholder="e.g. kanchi-heritage"
                className="w-full px-3.5 py-2.5 bg-[#090a0c] border border-white/[0.1] rounded-xl text-zinc-100 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-400/60"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClaiming}
                  className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  {isClaiming ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center text-zinc-400 text-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400/80 animate-ping" />
          <span className="font-normal text-xs tracking-wide">Authenticating session...</span>
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
