import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface BoutiqueTenant {
  id: string;
  slug: string;
  store_name: string;
  custom_domain?: string;
  contact_whatsapp?: string;
  whatsapp?: string;
  currency?: string;
  profit_margin_percent?: number;
  is_active: boolean;
  owner_id?: string;
  created_at?: string;
}

interface AdminTenantContextType {
  tenant: BoutiqueTenant | null;
  loading: boolean;
  user: any;
  refreshTenant: () => Promise<void>;
  claimTenant: (slug: string) => Promise<{ success: boolean; error?: string }>;
  getStorefrontUrl: () => string;
}

const AdminTenantContext = createContext<AdminTenantContextType | undefined>(undefined);

export function AdminTenantProvider({ children, user }: { children: React.ReactNode; user: any }) {
  const [tenant, setTenant] = useState<BoutiqueTenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenant = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // 1. Query the single store owned by this user
      const { data: ownedStore, error: ownedErr } = await supabase
        .from('boutique_tenants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (ownedErr) throw ownedErr;

      if (ownedStore) {
        setTenant(ownedStore as BoutiqueTenant);
        return;
      }

      // 2. If no store is linked to this account yet, check if there is an unassigned store to bind
      const { data: unownedStore, error: unownedErr } = await supabase
        .from('boutique_tenants')
        .select('*')
        .is('owner_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (unownedErr) throw unownedErr;

      if (unownedStore) {
        // Automatically link this store to the authenticated reseller
        await supabase
          .from('boutique_tenants')
          .update({ owner_id: user.id })
          .eq('id', unownedStore.id);

        setTenant({ ...unownedStore, owner_id: user.id } as BoutiqueTenant);
      } else {
        setTenant(null);
      }
    } catch (err) {
      console.error('[AdminTenantContext] Error loading boutique tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  const claimTenant = async (handle: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: 'User session not found' };
    const cleanHandle = handle.toLowerCase().trim();

    try {
      // Enforce strict 1 store per account rule
      const { data: existingOwned } = await supabase
        .from('boutique_tenants')
        .select('id, store_name')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (existingOwned) {
        return {
          success: false,
          error: `Your account is already linked to ${existingOwned.store_name}. Each account can only manage one boutique store.`,
        };
      }

      const { data: existing, error: fetchErr } = await supabase
        .from('boutique_tenants')
        .select('*')
        .eq('slug', cleanHandle)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!existing) {
        // Create new single store for this owner
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
        return { success: true };
      }

      // If store exists, check if already owned by someone else
      if (existing.owner_id && existing.owner_id !== user.id) {
        return { success: false, error: 'This boutique handle is already owned by another account.' };
      }

      // Claim and lock to this user account
      const { data: updatedTenant, error: updateErr } = await supabase
        .from('boutique_tenants')
        .update({ owner_id: user.id })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      setTenant(updatedTenant as BoutiqueTenant);
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
    const defaultBase = import.meta.env.VITE_DEFAULT_STORE_BASE_URL || 'https://www.weave365.com';
    return `${defaultBase}/store/${tenant.slug}`;
  };

  useEffect(() => {
    fetchTenant();
  }, [user?.id]);

  return (
    <AdminTenantContext.Provider
      value={{
        tenant,
        loading,
        user,
        refreshTenant: fetchTenant,
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
