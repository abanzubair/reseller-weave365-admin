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
          .select('id, is_published, sku, title, retail_price, base_price, images')
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
              customer_phone: iq.customer_phone,
              product_title: iq.product_title || (iq.sku ? `SKU: ${iq.sku}` : 'Catalog Inquiry'),
              sku: iq.sku || null,
              status: iq.status || 'Inquiry on WhatsApp',
              notes: iq.message || iq.subject || 'Storefront Inquiry',
              created_at: iq.created_at,
            }));
            combinedRecent = [...combinedRecent, ...mapped].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 6);
          }
        } catch (_) {}

        // Hydrate recent orders with images, SKU, and Weave365 links
        const enrichedRecent = combinedRecent.map((order) => {
          const extractedSku = 
            order.sku || 
            order.items?.[0]?.sku || 
            order.notes?.match(/SKU:\s*([A-Za-z0-9_-]+)/i)?.[1] || 
            '';

          const matchedProd = products?.find((p) => 
            (extractedSku && String(p.sku).toLowerCase().trim() === String(extractedSku).toLowerCase().trim()) ||
            (order.product_title && p.title.toLowerCase().trim() === order.product_title.toLowerCase().trim())
          );

          const finalSku = extractedSku || matchedProd?.sku || '';
          const phoneFromNote = order.notes?.match(/(?:Buyer WhatsApp|WhatsApp):\s*([+0-9\s-]+)/i)?.[1]?.trim() || '';
          const customerPhone = order.customer_phone || phoneFromNote || '';
          const imageUrl = 
            (matchedProd?.images && matchedProd.images.length > 0 ? matchedProd.images[0] : null) ||
            order.items?.[0]?.image ||
            null;

          const firstDigit = finalSku.trim().charAt(0);
          const categorySlug = firstDigit === '2' ? 'suit' : firstDigit === '3' ? 'dupatta' : firstDigit === '4' ? 'lehenga' : 'saree';
          const weave365Url = finalSku ? `https://www.weave365.com/${categorySlug}/${finalSku}` : 'https://www.weave365.com/catalogue';

          const pPrice = 
            ((order.total_amount ?? order.total_price) || 0) > 0 
              ? (order.total_amount ?? order.total_price)
              : (matchedProd?.retail_price || matchedProd?.base_price || 0);

          return {
            ...order,
            sku: finalSku,
            image_url: imageUrl,
            weave365_url: weave365Url,
            total_price: pPrice,
            customer_phone: customerPhone,
            total_amount: pPrice,
          };
        });

        setStats({
          totalProducts: products?.length || 0,
          activeListings: activeCount,
          totalOrders: totalOrdersCount,
          inquiries: inquiryCount,
        });
        setRecentOrders(enrichedRecent);
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
            {recentOrders.map((order) => {
              const buyerPhoneClean = order.customer_phone ? order.customer_phone.replace(/[^0-9]/g, '') : null;

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-white/[0.015] transition-colors group"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <a
                      href={order.weave365_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative shrink-0 block"
                      title="View on Weave365"
                    >
                      {order.image_url ? (
                        <div className="relative w-16 h-22 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/90 dark:border-white/[0.08] shadow-xs group/img">
                          <img
                            src={order.image_url}
                            alt={order.product_title || 'Saree'}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                            <ExternalLink size={13} className="text-white drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08] flex flex-col items-center justify-center text-zinc-400 gap-1">
                          <ShoppingBag size={16} />
                          <span className="text-[9px] uppercase font-mono text-zinc-400">Catalog</span>
                        </div>
                      )}
                    </a>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={order.weave365_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-base text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1 group/title"
                          title="View on Weave365"
                        >
                          <span className="line-clamp-1">{order.product_title || 'Boutique Saree'}</span>
                          <ExternalLink size={12} className="text-zinc-400 group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400 shrink-0" />
                        </a>

                        {order.sku && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-semibold shrink-0">
                            SKU: {order.sku}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {order.customer_name || 'Valued Patron'}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>

                      {buyerPhoneClean && (
                        <div className="pt-0.5">
                          <a
                            href={`https://wa.me/${buyerPhoneClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp: {order.customer_phone}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-white/[0.06]">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {((order.total_amount ?? order.total_price) || 0) > 0 ? (
                          `${tenant?.currency || '₹'}${((order.total_amount ?? order.total_price) || 0).toLocaleString()}`
                        ) : (
                          <span className="text-xs text-zinc-400 font-normal">Inquiry</span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {order.status || 'Inquiry on WhatsApp'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
