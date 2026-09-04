import { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Calendar, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminTenant } from '../lib/AdminTenantContext';

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
              total_amount: 0,
              total_price: 0,
              created_at: iq.created_at,
              is_inquiry_table: true,
            }));
            allRecords = [...allRecords, ...mappedInquiries].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          }
        } catch (_) {}

        setOrders(allRecords);
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
          filtered.map((order) => (
            <div
              key={order.id}
              className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-colors shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-base text-zinc-900 dark:text-zinc-200">
                    {order.customer_name || 'Valued Patron'}
                  </span>
                  <span className="text-[15px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.1]">
                    {order.status}
                  </span>
                </div>

                <div className="text-base text-zinc-800 dark:text-zinc-300 font-medium">{order.product_title || order.items?.[0]?.title || order.notes || 'Boutique Saree Item'}</div>

                {order.notes && (
                  <div className="text-[15px] text-zinc-700 dark:text-zinc-300 italic bg-zinc-100 dark:bg-white/[0.02] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.04] inline-block">
                    {order.notes}
                  </div>
                )}

                <div className="text-xs text-zinc-500 dark:text-zinc-300 flex items-center space-x-2">
                  <Calendar size={15} />
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-5 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-200 dark:border-white/[0.06]">
                <div className="text-left md:text-right">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {tenant?.currency || '₹'}
                    {((order.total_amount ?? order.total_price) || 0).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="px-3 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.1] rounded-xl text-[15px] text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                  >
                    <option value="Inquiry on WhatsApp">Inquiry on WhatsApp</option>
                    <option value="Order Placed on WhatsApp">Order Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {tenant?.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${tenant.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors"
                      title="Open WhatsApp Chat"
                    >
                      <MessageCircle size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
