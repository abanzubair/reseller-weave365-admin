import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface BoutiqueTenant {
  id: string;
  slug: string;
  store_name: string;
  custom_domain?: string;
  contact_whatsapp?: string;
  currency?: string;
  profit_margin_percent?: number;
  is_active: boolean;
  owner_id?: string;
  created_at?: string;
}

interface AdminTenantContextType {
  tenant: BoutiqueTenant | null;
  tenantsList: BoutiqueTenant[];
  loading: boolean;
  user: any;
  refreshTenant: () => Promise<void>;
  switchTenant: (slug: string) => void;
  claimTenant: (slug: string) => Promise<{ success: boolean; error?: string }>;
  getStorefrontUrl: () => string;
}

const AdminTenantContext = createContext<AdminTenantContextType | undefined>(undefined);

export function AdminTenantProvider({ children, user }: { children: React.ReactNode; user: any }) {
  const [tenant, setTenant] = useState<BoutiqueTenant | null>(null);
  const [tenantsList, setTenantsList] = useState<BoutiqueTenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('boutique_tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = (data || []) as BoutiqueTenant[];
      setTenantsList(list);

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const queryStore = urlParams?.get('store');

      const savedSlug = typeof window !== 'undefined' 
        ? (queryStore || localStorage.getItem('weave365_reseller_active_slug')) 
        : null;

      let current = list.find((t) => t.slug === savedSlug);
      if (!current) {
        current = list.find((t) => t.owner_id === user.id);
      }
      if (!current && list.length > 0) {
        current = list[0];
      }

      setTenant(current || null);
      if (current && typeof window !== 'undefined') {
        localStorage.setItem('weave365_reseller_active_slug', current.slug);
      }
    } catch (err) {
      console.error('[AdminTenantContext] Error loading tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = (slug: string) => {
    const target = tenantsList.find((t) => t.slug === slug);
    if (target) {
      setTenant(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('weave365_reseller_active_slug', target.slug);
      }
    }
  };

  const claimTenant = async (handle: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: 'User session not found' };
    const cleanHandle = handle.toLowerCase().trim();

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('boutique_tenants')
        .select('*')
        .eq('slug', cleanHandle)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!existing) {
        const { data: newTenant, error: insertErr } = await supabase
          .from('boutique_tenants')
          .insert({
            slug: cleanHandle,
            store_name: cleanHandle.toUpperCase(),
            owner_id: user.id,
            is_active: true,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        setTenant(newTenant as BoutiqueTenant);
        setTenantsList((prev) => [newTenant as BoutiqueTenant, ...prev]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('weave365_reseller_active_slug', newTenant.slug);
        }
        return { success: true };
      }

      const { data: updatedTenant, error: updateErr } = await supabase
        .from('boutique_tenants')
        .update({ owner_id: user.id })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      setTenant(updatedTenant as BoutiqueTenant);
      setTenantsList((prev) =>
        prev.map((t) => (t.id === updatedTenant.id ? (updatedTenant as BoutiqueTenant) : t))
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('weave365_reseller_active_slug', updatedTenant.slug);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to claim boutique' };
    }
  };

  const getStorefrontUrl = (): string => {
    if (!tenant) return '#';
    if (tenant.custom_domain) {
      return `https://${tenant.custom_domain}`;
    }
    const defaultBase = import.meta.env.VITE_DEFAULT_STORE_BASE_URL || 'https://weave365.com';
    return `${defaultBase}/${tenant.slug === '50k' ? '' : tenant.slug}`;
  };

  useEffect(() => {
    fetchTenants();
  }, [user?.id]);

  return (
    <AdminTenantContext.Provider
      value={{
        tenant,
        tenantsList,
        loading,
        user,
        refreshTenant: fetchTenants,
        switchTenant,
        claimTenant,
        getStorefrontUrl,
      }}
    >
      {children}
    </AdminTenantContext.Provider>
  );
}

export function useAdminTenant() {
  const context = useContext(AdminTenantContext);
  if (!context) {
    throw new Error('useAdminTenant must be used within an AdminTenantProvider');
  }
  return context;
}
