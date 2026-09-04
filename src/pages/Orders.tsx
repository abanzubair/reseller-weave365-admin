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
        const { data, error } = await supabase
          .from('boutique_orders')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
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
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      await supabase
        .from('boutique_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Customer Orders & Inquiries</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review incoming inquiries from your storefront, track fulfillment, and message patrons on WhatsApp.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, clients, notes..."
            className="w-full pl-9 pr-3 py-2 bg-[#111216] border border-white/[0.08] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white/[0.08] text-zinc-100 border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center bg-[#111216] border border-white/[0.07] rounded-xl">
            <ShoppingBag size={24} className="mx-auto text-zinc-600 mb-2" />
            <h3 className="text-sm font-medium text-zinc-300">No matching orders found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {activeTab === 'all'
                ? 'Share your storefront link to start receiving inquiries from clients.'
                : 'No orders match this status filter.'}
            </p>
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-[#111216] border border-white/[0.07] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/[0.12] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className="font-semibold text-xs text-zinc-200">
                    {order.customer_name || 'Valued Patron'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                    {order.status}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 font-medium">{order.product_title}</div>

                {order.notes && (
                  <div className="text-[11px] text-zinc-500 italic bg-white/[0.02] px-2.5 py-1 rounded-md border border-white/[0.04] inline-block">
                    {order.notes}
                  </div>
                )}

                <div className="text-[10px] text-zinc-500 flex items-center space-x-1.5">
                  <Calendar size={11} />
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                <div className="text-left md:text-right">
                  <div className="text-sm font-semibold text-zinc-100 tabular-nums">
                    {tenant?.currency || '₹'}
                    {(order.total_price || 0).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="px-2.5 py-1.5 bg-[#090a0c] border border-white/[0.1] rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-400/60"
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
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                      title="Open WhatsApp Chat"
                    >
                      <MessageCircle size={15} />
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
