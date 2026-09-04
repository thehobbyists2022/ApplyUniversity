// StepOne College - Server-Authoritative Subscription Entitlement
// Zero LocalStorage trust: Entitlement is strictly validated via Supabase profiles + JWT
import { supabase } from './supabaseClient';

// Clean up any legacy untrusted local keys on module load
try {
  localStorage.removeItem('stepone_pro_unlocked');
} catch {
  /* ignore */
}

// Strictly deprecated / returns false always to prevent client-side privilege tampering
export function getLocalPremium() {
  return false;
}

export function setLocalPremium() {
  // No-op: client cannot write local entitlement
}

// Server-authoritative entitlement check using authenticated JWT and trusted database time
export async function fetchPremiumFromProfile() {
  if (!supabase) return false;
  try {
    // 1. Preferred: Call RPC evaluated with database-side now() and auth.uid()
    const { data: rpcActive, error: rpcError } = await supabase.rpc('has_active_subscription');
    if (!rpcError && typeof rpcActive === 'boolean') {
      return rpcActive;
    }

    // 2. Direct query fallback
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, current_period_end')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return false;

    const isActive = data.subscription_status === 'active';
    if (!isActive) return false;

    if (data.current_period_end) {
      const expiresAt = new Date(data.current_period_end).getTime();
      if (Date.now() > expiresAt) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function getStripeUrls() {
  return {
    monthly: import.meta.env.VITE_STRIPE_MONTHLY_URL || 'https://buy.stripe.com/00w5kF71E71p14N1dNe7m00',
    seasonPass: import.meta.env.VITE_STRIPE_SEASON_PASS_URL || 'https://buy.stripe.com/cNiaEZ71E85tcNv1dNe7m01'
  };
}