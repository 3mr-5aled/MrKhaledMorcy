import { createClient } from "@supabase/supabase-js";

// Supabase client for server-side operations
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
    throw new Error("Missing Supabase URL configuration");
  }

  if (!supabaseKey) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
    );
    throw new Error("Missing Supabase API key configuration");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper to get public URL for uploaded files
export const getSupabasePublicUrl = (bucket: string, path: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL for public URL generation");
    return ""; // Return empty string instead of throwing
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};
