// StepOne College Phase 7 — Supabase Auth helpers
import { supabase } from './supabaseClient';

export async function getSession() {
  if (!supabase) return { data: { session: null }, error: null };
  try {
    return await supabase.auth.getSession();
  } catch (error) {
    return { data: { session: null }, error };
  }
}

export async function signInWithEmail(email, password) {
  if (!supabase) return { data: { session: null, user: null }, error: { message: 'Supabase not configured' } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email, password) {
  if (!supabase) return { data: { session: null, user: null }, error: { message: 'Supabase not configured' } };
  return supabase.auth.signUp({ email, password });
}

export async function signOutUser() {
  if (!supabase) return null;
  return supabase.auth.signOut();
}

export async function sendPasswordReset(email) {
  if (!supabase) return { error: { message: 'Supabase not configured' } };
  return supabase.auth.resetPasswordForEmail(email);
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}