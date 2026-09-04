import { useState, useEffect } from 'react';
import { Search, Save, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminTenant } from '../lib/AdminTenantContext';

export default function Products() {
  const { tenant } = useAdminTenant();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant?.id) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('boutique_products')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('[Products] Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [tenant?.id]);

  const handlePriceChange = (id: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const wholesale = p.wholesale_price || p.retail_price || 0;
          const markup = wholesale > 0 ? Math.round(((newPrice - wholesale) / wholesale) * 100) : 0;
          return { ...p, retail_price: newPrice, profit_margin_percent: markup };
        }
        return p;
      })
    );
  };

  const handleSavePrice = async (product: any) => {
    try {
      setSavingId(product.id);
      const { error } = await supabase
        .from('boutique_products')
        .update({
          retail_price: product.retail_price,
          profit_margin_percent: product.profit_margin_percent,
        })
        .eq('id', product.id);

      if (error) throw error;

      setSavedId(product.id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      console.error('[Products] Save error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      const updatedStatus = !product.is_active;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: updatedStatus } : p))
      );

      await supabase
        .from('boutique_products')
        .update({ is_active: updatedStatus })
        .eq('id', product.id);
    } catch (err) {
      console.error('[Products] Toggle error:', err);
    }
  };

  const filtered = products.filter((p) =>
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Saree Catalog & Markups</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Set customer retail prices, calculate profit margins, and manage product visibility.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-9 pr-3 py-2 bg-[#111216] border border-white/[0.08] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#111216] border border-white/[0.07] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            No sarees found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.07] text-zinc-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Saree Product</th>
                  <th className="py-3 px-4">Wholesale Base</th>
                  <th className="py-3 px-4">Retail Price ({tenant?.currency || '₹'})</th>
                  <th className="py-3 px-4">Markup Margin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((item) => {
                  const wholesale = item.wholesale_price || item.retail_price || 0;
                  const markup = item.profit_margin_percent ?? (
                    wholesale > 0 ? Math.round(((item.retail_price - wholesale) / wholesale) * 100) : 0
                  );

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-zinc-500 text-[10px] shrink-0">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-zinc-200 truncate max-w-xs">{item.title}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">SKU: {item.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400 tabular-nums">
                        {tenant?.currency || '₹'}{wholesale.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-zinc-500">{tenant?.currency || '₹'}</span>
                          <input
                            type="number"
                            value={item.retail_price || 0}
                            onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-[#090a0c] border border-white/[0.1] rounded-lg text-zinc-100 font-mono text-xs tabular-nums focus:outline-none focus:border-amber-400/60"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums border ${
                            markup > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border-white/[0.06]'
                          }`}
                        >
                          +{markup}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                            item.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800/80 text-zinc-400 border-white/[0.06]'
                          }`}
                        >
                          {item.is_active ? 'Published' : 'Hidden'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSavePrice(item)}
                          disabled={savingId === item.id}
                          className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 rounded-lg text-xs transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          {savedId === item.id ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">Saved</span>
                            </>
                          ) : (
                            <>
                              <Save size={12} className="text-zinc-400" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
