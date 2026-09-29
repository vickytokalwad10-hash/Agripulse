import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sxzklpjmehfmwxahxtov.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sandbox_anon_key_agripulse_2026';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper for Supabase Email/Password Signup
export async function supabaseSignUp({ email, password, role = 'farmer', name, phone, village, district, state, company, gst }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          role,
          phone,
          village,
          district,
          state,
          company,
          gst
        }
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase SignUp Error (falling back gracefully):', err.message);
    return { data: null, error: err };
  }
}

// Helper for Supabase Email/Password Login
export async function supabaseSignIn({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase SignIn Error (falling back gracefully):', err.message);
    return { data: null, error: err };
  }
}

// Helper for Supabase Passwordless Magic Link / OTP
export async function supabaseSendOtp({ email }) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase OTP Error:', err.message);
    return { data: null, error: err };
  }
}

// Helper for Supabase Verify OTP
export async function supabaseVerifyOtp({ email, token }) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase Verify OTP Error:', err.message);
    return { data: null, error: err };
  }
}

// Helper for Supabase Sign Out
export async function supabaseSignOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase SignOut error:', err);
  }
}
