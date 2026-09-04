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
          const basePrice = p.base_price ?? p.wholesale_price ?? p.retail_price ?? 0;
          const markup = basePrice > 0 ? Math.round(((newPrice - basePrice) / basePrice) * 100) : 0;
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
      const currentPublished = product.is_published ?? product.is_active ?? true;
      const updatedStatus = !currentPublished;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_published: updatedStatus, is_active: updatedStatus } : p))
      );

      await supabase
        .from('boutique_products')
        .update({ is_published: updatedStatus })
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
    <div className="max-w-6xl mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Saree Catalog & Markups</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5">
            Set customer retail prices, calculate profit margins, and manage product visibility.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-base text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-base text-zinc-500 dark:text-zinc-300">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center text-base text-zinc-500 dark:text-zinc-300">
            No sarees found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead className="bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/[0.07] text-zinc-700 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="py-3 px-4">Saree Product</th>
                  <th className="py-3 px-4">Cost Price</th>
                  <th className="py-3 px-4">Retail Price ({tenant?.currency || '₹'})</th>
                  <th className="py-3 px-4">Markup Margin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                {filtered.map((item) => {
                  const basePrice = item.base_price ?? item.wholesale_price ?? item.retail_price ?? 0;
                  const markup = basePrice > 0 ? Math.round(((item.retail_price - basePrice) / basePrice) * 100) : 0;
                  const imageUrl = (item.images && item.images.length > 0) ? item.images[0] : (item.image_url || null);
                  const isPublished = item.is_published ?? item.is_active ?? true;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3.5">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.07] flex items-center justify-center text-zinc-500 text-base shrink-0">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-zinc-900 dark:text-zinc-200 truncate max-w-xs">{item.title}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">SKU: {item.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-200 tabular-nums font-medium">
                        {tenant?.currency || '₹'}{basePrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-zinc-500 dark:text-zinc-400">{tenant?.currency || '₹'}</span>
                          <input
                            type="number"
                            value={item.retail_price || 0}
                            onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                            className="w-24 px-2.5 py-1 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.1] rounded-xl text-zinc-900 dark:text-zinc-100 font-mono text-xs tabular-nums focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums font-semibold border ${
                            markup > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.1]'
                          }`}
                        >
                          +{markup}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors border ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.1]'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Hidden'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSavePrice(item)}
                          disabled={savingId === item.id}
                          className="px-3 py-1 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          {savedId === item.id ? (
                            <>
                              <Check size={16} className="text-emerald-500 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} className="text-zinc-500 dark:text-zinc-300" />
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
