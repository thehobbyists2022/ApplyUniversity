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

// Strictly fail-closed entitlement check: ONLY data === true from the server RPC grants access
export async function fetchPremiumFromProfile() {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.rpc('has_active_subscription');
    if (error) {
      console.warn('[Subscription] Verification returned error (treating as inactive):', error.message);
      return false;
    }
    return data === true;
  } catch (err) {
    console.error('[Subscription] Verification exception (treating as inactive):', err);
    return false;
  }
}

export function getStripeUrls() {
  return {
    monthly: import.meta.env.VITE_STRIPE_MONTHLY_URL || 'https://buy.stripe.com/00w5kF71E71p14N1dNe7m00',
    seasonPass: import.meta.env.VITE_STRIPE_SEASON_PASS_URL || 'https://buy.stripe.com/cNiaEZ71E85tcNv1dNe7m01'
  };
}