
import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const password = body.password;
    if (!password) {
      console.log("[EDGE] Missing password!");
      return new Response(
        JSON.stringify({ success: false, error: "Missing password" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Set up Supabase client
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch owner password config
    const { data: configs, error: configError } = await client
      .from("auth_config")
      .select("config_key, config_value");
    if (configError) {
      console.log("[EDGE] Config error:", configError);
      throw configError;
    }

    const ownerPassword = configs?.find((c: any) => c.config_key === "owner_password")?.config_value;
    if (!ownerPassword) {
      console.log("[EDGE] No owner password set in config!");
      return new Response(
        JSON.stringify({ success: false, error: "No owner password set" }),
        { status: 500, headers: corsHeaders }
      );
    }
    if (password !== ownerPassword) {
      console.log("[EDGE] Invalid password attempt.");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid password" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Get user IP from known sources
    const headers = Object.fromEntries(req.headers.entries());
    const denoHeaderIP =
      headers["x-forwarded-for"] ||
      headers["x-real-ip"] ||
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null;

    // Try to query IP via Supabase Postgres fn (source of truth for check_admin_access!)
    const { data: ip_data, error: ip_error } = await client.rpc("get_user_ip");
    const db_ip = (ip_data && typeof ip_data === "string") ? ip_data : null;

    const ip_address = db_ip || denoHeaderIP || "unknown_ip";
    console.log("[EDGE] Insert owner with ip (db_ip):", db_ip, " header_ip:", denoHeaderIP);

    // Upsert row in admin_users
    const { error: upsertError } = await client
      .from("admin_users")
      .upsert({
        ip_address,
        role: "owner",
        approved_by: "system",
        approved_at: new Date().toISOString(),
        last_access: new Date().toISOString(),
      });

    if (upsertError) {
      console.log("[EDGE] Upsert error:", upsertError);
      throw upsertError;
    }

    console.log("[EDGE] Owner login OK. Inserted ip:", ip_address);

    return new Response(JSON.stringify({ success: true, role: "owner", ip_address }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.log("[EDGE] ERROR:", e);
    return new Response(
      JSON.stringify({ success: false, error: String(e?.message || e) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
