import { useState } from 'react';
import { Save, Check, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminTenant } from '../lib/AdminTenantContext';

export default function Settings() {
  const { tenant, refreshTenant } = useAdminTenant();
  const [storeName, setStoreName] = useState(tenant?.store_name || '');
  const [whatsapp, setWhatsapp] = useState(tenant?.contact_whatsapp || '');
  const [currency, setCurrency] = useState(tenant?.currency || 'INR');
  const [customDomain, setCustomDomain] = useState(tenant?.custom_domain || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    try {
      setSaving(true);
      setErrorMsg(null);

      const { error } = await supabase
        .from('boutique_tenants')
        .update({
          store_name: storeName.trim(),
          contact_whatsapp: whatsapp.trim(),
          currency: currency.trim(),
          custom_domain: customDomain.trim() || null,
        })
        .eq('id', tenant.id);

      if (error) throw error;

      await refreshTenant();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('[Settings] Update error:', err);
      setErrorMsg(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-white/[0.07]">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Store Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure your boutique branding, WhatsApp checkout recipient, and custom domain setup.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Boutique Profile */}
        <div className="p-5 bg-[#111216] border border-white/[0.07] rounded-xl space-y-4">
          <h2 className="text-sm font-semibold text-zinc-200">Boutique Identity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Boutique Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Radhika Heritage Sarees"
                className="w-full px-3 py-2 bg-[#090a0c] border border-white/[0.08] rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Boutique Handle (Slug)</label>
              <input
                type="text"
                disabled
                value={tenant?.slug || ''}
                className="w-full px-3 py-2 bg-[#090a0c]/60 border border-white/[0.05] rounded-xl text-xs text-zinc-400 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Assigned by Weave365 network</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">WhatsApp Contact Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-[#090a0c] border border-white/[0.08] rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Used for patron direct chat and checkout</span>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Store Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#090a0c] border border-white/[0.08] rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400/60"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Domain Section pointing to reseller.weave365.com */}
        <div className="p-5 bg-[#111216] border border-white/[0.07] rounded-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Globe size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Custom Domain Configuration</h2>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Domain Name</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="e.g. shop.radhikasarees.com"
              className="w-full px-3 py-2 bg-[#090a0c] border border-white/[0.08] rounded-xl text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs text-zinc-400 space-y-2">
            <div className="text-zinc-300 font-medium">DNS CNAME Instructions:</div>
            <p className="text-[11px] leading-relaxed">
              In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.), create a <strong>CNAME</strong> record:
            </p>
            <div className="p-2 bg-[#090a0c] border border-white/[0.06] rounded-lg font-mono text-[11px] text-amber-300 flex items-center justify-between">
              <span>CNAME &bull; Host: shop &bull; Value: reseller.weave365.com</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-xs rounded-xl transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check size={14} />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
