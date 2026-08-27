// StepOne College Phase 7 — Premium subscription helpers
// 訂閱狀態優先讀取 Supabase profiles 表, 無資料表/未連線時回退 localStorage 手動解鎖
import { supabase } from './supabaseClient';

const PREMIUM_KEY = 'stepone_pro_unlocked';

export function getLocalPremium() {
  try {
    return localStorage.getItem(PREMIUM_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setLocalPremium(value) {
  try {
    localStorage.setItem(PREMIUM_KEY, String(Boolean(value)));
  } catch {
    /* ignore */
  }
}

// 從 Supabase profiles 讀取訂閱狀態 (subscription_status = 'active')
export async function fetchPremiumFromProfile(userId) {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return Boolean(data && data.subscription_status === 'active');
  } catch {
    return null;
  }
}

export function getStripeUrls() {
  return {
    monthly: import.meta.env.VITE_STRIPE_MONTHLY_URL || 'https://buy.stripe.com/00w5kF71E71p14N1dNe7m00',
    seasonPass: import.meta.env.VITE_STRIPE_SEASON_PASS_URL || 'https://buy.stripe.com/cNiaEZ71E85tcNv1dNe7m01'
  };
}