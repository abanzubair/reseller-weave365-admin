import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminTenant } from '../lib/AdminTenantContext';

export default function Settings() {
  const { tenant, refreshTenant } = useAdminTenant();
  const [storeName, setStoreName] = useState(tenant?.store_name || '');
  const [whatsapp, setWhatsapp] = useState(tenant?.whatsapp || '');
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
          whatsapp: whatsapp.trim(),
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
    <div className="max-w-3xl mx-auto space-y-7">
      <div className="pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Store Settings</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5">
          Configure your boutique branding and WhatsApp checkout recipient.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-base">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Boutique Profile */}
        <div className="p-6 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-200">Boutique Identity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-zinc-800 dark:text-zinc-200 mb-1.5 font-medium">Boutique Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Radhika Heritage Sarees"
                className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-800 dark:text-zinc-200 mb-1.5 font-medium">Boutique Handle (Slug)</label>
              <input
                type="text"
                disabled
                value={tenant?.slug || ''}
                className="w-full px-3.5 py-2 bg-zinc-100 dark:bg-[#090a0c]/60 border border-zinc-200 dark:border-white/[0.05] rounded-xl text-sm text-zinc-500 dark:text-zinc-300 font-mono cursor-not-allowed"
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-300 mt-1 block">Assigned by Weave365 network</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm text-zinc-800 dark:text-zinc-200 mb-1.5 font-medium">WhatsApp Contact Number</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-300 mt-1 block">Used for patron direct WhatsApp checkout and order inquiries</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-sm rounded-xl transition-colors inline-flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check size={18} />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
