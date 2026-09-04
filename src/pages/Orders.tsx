import { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Calendar, Search, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminTenant } from '../lib/AdminTenantContext';

function getCleanNote(notes?: string | null): string | null {
  if (!notes) return null;
  const trimmed = notes.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'storefront inquiry' || lower === 'catalog inquiry') return null;
  if (/^(Instant Order|Inquiry)\s+for\s+SKU:/i.test(trimmed)) {
    const parts = trimmed.split('|').map((p) => p.trim());
    const filtered = parts.filter(
      (p) =>
        !/^(Instant Order|Inquiry\s+for\s+SKU|Buyer WhatsApp|Customer:|SKU:)/i.test(p)
    );
    if (filtered.length > 0) {
      return filtered.join(' • ');
    }
    return null;
  }
  return trimmed;
}

export default function Orders() {
  const { tenant } = useAdminTenant();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!tenant?.id) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data: ordersData } = await supabase
          .from('boutique_orders')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        // Fetch products to resolve details, images, and SKU
        const { data: prods } = await supabase
          .from('boutique_products')
          .select('sku, title, retail_price, base_price, images, category')
          .eq('tenant_id', tenant.id);

        const prodSkuMap = new Map<string, any>();
        const prodTitleMap = new Map<string, any>();
        (prods || []).forEach((p) => {
          if (p.sku) prodSkuMap.set(String(p.sku).toLowerCase().trim(), p);
          if (p.title) prodTitleMap.set(p.title.toLowerCase().trim(), p);
        });

        let allRecords = [...(ordersData || [])];

        try {
          const { data: inqData } = await supabase
            .from('boutique_inquiries')
            .select('*')
            .eq('tenant_id', tenant.id)
            .order('created_at', { ascending: false });

          if (inqData && inqData.length > 0) {
            const mappedInquiries = inqData.map((iq) => ({
              id: iq.id,
              tenant_id: iq.tenant_id,
              customer_name: iq.customer_name,
              customer_phone: iq.customer_phone,
              customer_email: iq.customer_email,
              status: iq.status || 'Inquiry on WhatsApp',
              notes: iq.message || iq.subject || 'Storefront Inquiry',
              product_title: iq.product_title || (iq.sku ? `SKU: ${iq.sku}` : 'Catalog Inquiry'),
              sku: iq.sku || null,
              created_at: iq.created_at,
              is_inquiry_table: true,
            }));
            allRecords = [...allRecords, ...mappedInquiries].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          }
        } catch (_) {}

        // Hydrate all orders & inquiries with SKU, Image, Weave365 Link, and Catalog Price
        const enrichedRecords = allRecords.map((order) => {
          const extractedSku = 
            order.sku || 
            order.items?.[0]?.sku || 
            order.notes?.match(/SKU:\s*([A-Za-z0-9_-]+)/i)?.[1] || 
            '';

          const matchedProd = 
            (extractedSku && prodSkuMap.get(String(extractedSku).toLowerCase().trim())) ||
            (order.product_title && prodTitleMap.get(order.product_title.toLowerCase().trim())) ||
            null;

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

          const price = 
            ((order.total_amount ?? order.total_price) || 0) > 0 
              ? (order.total_amount ?? order.total_price)
              : (matchedProd?.retail_price || matchedProd?.base_price || 0);

          return {
            ...order,
            sku: finalSku,
            image_url: imageUrl,
            weave365_url: weave365Url,
            total_amount: price,
            total_price: price,
            customer_phone: customerPhone,
          };
        });

        setOrders(enrichedRecords);
      } catch (err) {
        console.error('[Orders] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tenant?.id]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (targetOrder?.is_inquiry_table) {
        await supabase
          .from('boutique_inquiries')
          .update({ status: newStatus })
          .eq('id', orderId);
      } else {
        await supabase
          .from('boutique_orders')
          .update({ status: newStatus })
          .eq('id', orderId);
      }
    } catch (err) {
      console.error('[Orders] Update error:', err);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders & Inquiries' },
    { id: 'inquiries', label: 'WhatsApp Inquiries' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'completed', label: 'Delivered' },
  ];

  const filtered = orders.filter((o) => {
    const matchesSearch =
      (o.product_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.notes || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'inquiries') return o.status === 'Inquiry on WhatsApp';
    if (activeTab === 'confirmed') return o.status === 'Order Placed on WhatsApp' || o.status === 'Confirmed';
    if (activeTab === 'shipped') return o.status === 'Shipped';
    if (activeTab === 'completed') return o.status === 'Delivered';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Customer Orders & Inquiries</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5">
            Review incoming inquiries from your storefront, track fulfillment, and message patrons on WhatsApp.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, clients, notes..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-base text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 shadow-sm"
          />
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-base font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-zinc-200/80 dark:bg-white/[0.08] text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-white/[0.08] shadow-sm'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.03]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-base text-zinc-500 dark:text-zinc-300">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl shadow-sm">
            <ShoppingBag size={28} className="mx-auto text-zinc-400 dark:text-zinc-400 mb-3" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-300">No matching orders found</h3>
            <p className="text-[15px] text-zinc-600 dark:text-zinc-300 mt-1.5">
              {activeTab === 'all'
                ? 'Share your storefront link to start receiving inquiries from clients.'
                : 'No orders match this status filter.'}
            </p>
          </div>
        ) : (
          filtered.map((order) => {
            const cleanNote = getCleanNote(order.notes);
            const buyerPhoneClean = order.customer_phone ? order.customer_phone.replace(/[^0-9]/g, '') : null;
            const buyerFirstName = order.customer_name ? order.customer_name.trim().split(' ')[0] : 'Buyer';

            return (
              <div
                key={order.id}
                className="p-4 sm:p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-colors shadow-sm group"
              >
                <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                  {/* Large Luxury Saree Thumbnail */}
                  <a
                    href={order.weave365_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative shrink-0 block"
                    title="Click to view original product on Weave365"
                  >
                    {order.image_url ? (
                      <div className="relative w-24 h-32 sm:w-28 sm:h-38 md:w-32 md:h-42 rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/90 dark:border-white/[0.08] shadow-xs group/img">
                        <img
                          src={order.image_url}
                          alt={order.product_title || 'Saree'}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-center p-2.5">
                          <span className="text-[11px] font-medium text-white flex items-center gap-1 drop-shadow-sm">
                            <span>Weave365</span>
                            <ExternalLink size={12} />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-32 sm:w-28 sm:h-38 md:w-32 md:h-42 rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.08] flex flex-col items-center justify-center text-zinc-400 gap-1.5 p-2 text-center">
                        <ShoppingBag size={22} className="text-zinc-400 dark:text-zinc-500" />
                        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Catalog</span>
                      </div>
                    )}
                  </a>

                  {/* Distilled Details */}
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Product Title & SKU Tag */}
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={order.weave365_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group/title"
                        title="View original product page on Weave365"
                      >
                        <span className="line-clamp-1">{order.product_title || order.items?.[0]?.title || 'Boutique Saree Item'}</span>
                        <ExternalLink size={14} className="text-zinc-400 group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400 shrink-0" />
                      </a>

                      {order.sku && (
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-semibold tracking-wide shrink-0">
                          SKU: {order.sku}
                        </span>
                      )}
                    </div>

                    {/* Patron Name & Timestamp */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                        {order.customer_name || 'Valued Patron'}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs">
                        <Calendar size={12} className="shrink-0" />
                        <span>{new Date(order.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </span>
                    </div>

                    {/* Genuine Customer Note only if non-boilerplate */}
                    {cleanNote && (
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/[0.025] px-3 py-1.5 rounded-lg border border-zinc-200/80 dark:border-white/[0.05] inline-block max-w-xl">
                        <span className="text-zinc-400 mr-1.5 font-medium">Note:</span>
                        <span>{cleanNote}</span>
                      </div>
                    )}

                    {/* Direct Tactile WhatsApp Action Pill */}
                    {buyerPhoneClean && (
                      <div className="pt-1">
                        <a
                          href={`https://wa.me/${buyerPhoneClean}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 transition-all shadow-2xs group/wa"
                          title={`Open WhatsApp chat with ${order.customer_name || 'buyer'}`}
                        >
                          <MessageCircle size={14} className="text-emerald-600 dark:text-emerald-400 group-hover/wa:scale-110 transition-transform" />
                          <span>Chat with {buyerFirstName} ({order.customer_phone})</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Tabular Price & Status Selector */}
                <div className="flex sm:flex-col items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-200 dark:border-white/[0.06] shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {((order.total_amount ?? order.total_price) || 0) > 0 ? (
                        `${tenant?.currency || '₹'}${((order.total_amount ?? order.total_price) || 0).toLocaleString()}`
                      ) : (
                        <span className="text-xs text-zinc-400 font-normal">Catalog Inquiry</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      {((order.total_amount ?? order.total_price) || 0) > 0 ? 'Retail Price' : 'Inquiry'}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      aria-label={`Update status for ${order.product_title || 'order'}`}
                      className="px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.1] rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors cursor-pointer shadow-2xs"
                    >
                      <option value="Inquiry on WhatsApp">Inquiry on WhatsApp</option>
                      <option value="Order Placed on WhatsApp">Order Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
