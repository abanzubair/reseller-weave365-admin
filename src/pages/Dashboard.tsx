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
          .select('id, is_published')
          .eq('tenant_id', tenant.id);

        const { data: orders } = await supabase
          .from('boutique_orders')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(6);

        const activeCount = products?.filter((p) => p.is_published ?? true).length || 0;
        let inquiryCount = orders?.filter((o) => o.status === 'Inquiry on WhatsApp' || o.status === 'New Inquiry').length || 0;
        let totalOrdersCount = orders?.length || 0;
        let combinedRecent = [...(orders || [])];

        try {
          const { data: inq } = await supabase
            .from('boutique_inquiries')
            .select('*')
            .eq('tenant_id', tenant.id)
            .order('created_at', { ascending: false })
            .limit(6);

          if (inq && inq.length > 0) {
            inquiryCount += inq.length;
            totalOrdersCount += inq.length;
            const mapped = inq.map(iq => ({
              id: iq.id,
              customer_name: iq.customer_name,
              product_title: iq.product_title || (iq.sku ? `SKU: ${iq.sku}` : 'Catalog Inquiry'),
              status: iq.status || 'Inquiry on WhatsApp',
              total_price: 0,
              total_amount: 0,
              created_at: iq.created_at,
            }));
            combinedRecent = [...combinedRecent, ...mapped].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 6);
          }
        } catch (_) {}

        setStats({
          totalProducts: products?.length || 0,
          activeListings: activeCount,
          totalOrders: totalOrdersCount,
          inquiries: inquiryCount,
        });
        setRecentOrders(combinedRecent);
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
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {tenant?.store_name || 'Boutique'} Workspace
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300 mt-1.5">
            Manage your saree catalog, wholesale profit markups, and customer WhatsApp inquiries.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyStoreLink}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-white/[0.08] text-base font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-500 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={16} className="text-zinc-500 dark:text-zinc-400" />
                <span>Copy Store URL</span>
              </>
            )}
          </button>

          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-base transition-colors shadow-sm"
          >
            <span>View Live Store</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* 3-Column Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">Active Saree Catalog</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1.5 tabular-nums">
              {stats.activeListings}{' '}
              <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">/ {stats.totalProducts}</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-700 dark:text-zinc-300">
            <Package size={22} />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">Total Inquiries & Orders</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1.5 tabular-nums">
              {stats.totalOrders}
            </div>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-700 dark:text-zinc-300">
            <ShoppingBag size={22} />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">Pending Inquiries</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1.5 tabular-nums">
              {stats.inquiries}
            </div>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-700 dark:text-zinc-300">
            <MessageCircle size={22} />
          </div>
        </div>
      </div>

      {/* Recent Inquiries Section */}
      <div className="bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-200 dark:border-white/[0.07] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Customer Inquiries</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
              Live orders and WhatsApp queries originating from your boutique storefront.
            </p>
          </div>
          <NavLink
            to="/orders"
            className="text-xs text-amber-600 dark:text-amber-400/90 hover:text-amber-500 font-medium transition-colors"
          >
            View all orders &rarr;
          </NavLink>
        </div>

        {loading ? (
          <div className="p-10 text-center text-base text-zinc-500">Loading inquiries...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] flex items-center justify-center text-zinc-500 dark:text-zinc-300 mx-auto mb-4">
              <Store size={22} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No customer inquiries yet</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 max-w-sm mx-auto">
              Share your store link with customers to begin receiving WhatsApp inquiries and orders.
            </p>
            <button
              onClick={handleCopyStoreLink}
              className="mt-5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/[0.08] text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-white/[0.08] transition-colors"
            >
              {copied ? 'Link Copied!' : 'Copy Store Link'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-white/[0.015] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-base text-zinc-900 dark:text-zinc-200">
                      {order.customer_name || 'Valued Patron'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.1]">
                      {order.status || 'New'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1">{order.product_title}</div>
                </div>

                <div className="flex items-center space-x-5">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {tenant?.currency || '₹'}
                      {((order.total_amount ?? order.total_price) || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
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
