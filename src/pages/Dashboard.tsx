import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Store,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminTenant } from '../lib/AdminTenantContext';

export default function Dashboard() {
  const { tenant, getStorefrontUrl } = useAdminTenant();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    totalOrders: 0,
    inquiries: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tenant?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const { data: products } = await supabase
          .from('boutique_products')
          .select('id, is_active')
          .eq('tenant_id', tenant.id);

        const { data: orders } = await supabase
          .from('boutique_orders')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(6);

        const activeCount = products?.filter((p) => p.is_active).length || 0;
        const inquiryCount = orders?.filter((o) => o.status === 'Inquiry on WhatsApp').length || 0;

        setStats({
          totalProducts: products?.length || 0,
          activeListings: activeCount,
          totalOrders: orders?.length || 0,
          inquiries: inquiryCount,
        });
        setRecentOrders(orders || []);
      } catch (err) {
        console.error('[Dashboard] Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenant?.id]);

  const storefrontUrl = getStorefrontUrl();

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            {tenant?.store_name || 'Boutique'} Workspace
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your saree catalog, wholesale profit markups, and customer WhatsApp inquiries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyStoreLink}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-zinc-400" />
                <span>Copy Store URL</span>
              </>
            )}
          </button>

          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-xs transition-colors"
          >
            <span>View Live Store</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* 3-Column Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-[#111216] border border-white/[0.07] rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 font-normal">Active Saree Catalog</div>
            <div className="text-2xl font-semibold text-zinc-100 mt-1 tabular-nums">
              {stats.activeListings}{' '}
              <span className="text-xs font-normal text-zinc-500">/ {stats.totalProducts}</span>
            </div>
          </div>
          <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-zinc-300">
            <Package size={18} />
          </div>
        </div>

        <div className="p-4 bg-[#111216] border border-white/[0.07] rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 font-normal">Total Inquiries & Orders</div>
            <div className="text-2xl font-semibold text-zinc-100 mt-1 tabular-nums">
              {stats.totalOrders}
            </div>
          </div>
          <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-zinc-300">
            <ShoppingBag size={18} />
          </div>
        </div>

        <div className="p-4 bg-[#111216] border border-white/[0.07] rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 font-normal">Pending Inquiries</div>
            <div className="text-2xl font-semibold text-zinc-100 mt-1 tabular-nums">
              {stats.inquiries}
            </div>
          </div>
          <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-zinc-300">
            <MessageCircle size={18} />
          </div>
        </div>
      </div>

      {/* Recent Inquiries Section */}
      <div className="bg-[#111216] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Recent Customer Inquiries</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live orders and WhatsApp queries originating from your boutique storefront.
            </p>
          </div>
          <NavLink
            to="/orders"
            className="text-xs text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
          >
            View all orders &rarr;
          </NavLink>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading inquiries...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 mx-auto mb-3">
              <Store size={18} />
            </div>
            <h3 className="text-sm font-medium text-zinc-300">No customer inquiries yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Share your store link with customers to begin receiving WhatsApp inquiries and orders.
            </p>
            <button
              onClick={handleCopyStoreLink}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-xs text-zinc-200 border border-white/[0.08] transition-colors"
            >
              {copied ? 'Link Copied!' : 'Copy Store Link'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-xs text-zinc-200">
                      {order.customer_name || 'Valued Patron'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                      {order.status || 'New'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 line-clamp-1">{order.product_title}</div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-100 tabular-nums">
                      {tenant?.currency || '₹'}
                      {(order.total_price || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
