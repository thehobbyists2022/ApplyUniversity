import { supabase } from '../lib/supabaseClient';

/**
 * StepOne College - Authentication & Credential Service
 * Built for 2026-2027 Google Play Standards (Zero-Tap Sign-In & Data Safety)
 */

// 1. Google Play Zero-Tap Sign-In / Restore Credentials API
// Stores the credentials in the Android Credential Manager natively via the Web API.
export async function storeCredentialsForZeroTap(email, password) {
  try {
    if (window.PasswordCredential && navigator.credentials) {
      const cred = new window.PasswordCredential({
        id: email,
        password: password,
        name: email,
      });
      await navigator.credentials.store(cred);
      console.log('[Auth] Credentials stored for Zero-Tap Sign-In');
    }
  } catch (err) {
    console.warn('[Auth] Failed to store credentials for Zero-Tap:', err);
  }
}

// Attempts to restore the session automatically using Zero-Tap (Restore Credentials API)
// Ideal to call on App Mount if Supabase session is null
export async function attemptZeroTapRestore() {
  try {
    if (navigator.credentials) {
      const cred = await navigator.credentials.get({
        password: true,
        mediation: 'silent', // Silent restore for Zero-Tap
      });
      
      if (cred && cred.id && cred.password) {
        console.log('[Auth] Restored credentials via Zero-Tap');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cred.id,
          password: cred.password
        });
        return { data, error };
      }
    }
  } catch (err) {
    console.warn('[Auth] Zero-Tap restore failed or not supported:', err);
  }
  return { data: null, error: null };
}

// 2. Google Play Data Safety: Delete Account functionality
// Permanently deletes user account and triggers DB cascade deletes (requires Edge Function or RPC)
export async function deleteUserAccount() {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User not logged in');

  try {
    // Call custom Supabase RPC to delete the user from auth.users
    // (Note: Supabase requires a Postgres function with SECURITY DEFINER to delete auth.users)
    const { error: rpcError } = await supabase.rpc('delete_user_account');
    
    if (rpcError) {
      console.error('[Auth] RPC Deletion Failed:', rpcError);
      throw rpcError;
    }

    // Clear Zero-Tap stored credentials to prevent auto-login
    if (navigator.credentials && navigator.credentials.preventSilentAccess) {
      await navigator.credentials.preventSilentAccess();
    }

    // Clear all user application data from localStorage
    try {
      localStorage.removeItem('unipath_saved_colleges');
      localStorage.removeItem('stepone_pro_unlocked');
      localStorage.removeItem('campuso_alignment_prefs');
      localStorage.removeItem('campuso_recycle_state');
      localStorage.removeItem('campuso_activity_polish');
      localStorage.removeItem('campuso_drafts');
    } catch {
      /* ignore */
    }

    // Sign out from local state
    await supabase.auth.signOut();
    
    return { success: true };
  } catch (error) {
    console.error('[Auth] Account Deletion Error:', error);
    return { success: false, error };
  }
}
