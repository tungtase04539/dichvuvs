import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Test API để kiểm tra Supabase Auth Admin
export async function GET() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    
    // Decode JWT to check if it's service_role
    let keyInfo = "unknown";
    try {
      const payload = JSON.parse(atob(serviceKey.split('.')[1]));
      keyInfo = payload.role || "no role found";
    } catch {
      keyInfo = "invalid JWT format";
    }

    const checks = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      keyLength: serviceKey.length,
      keyRole: keyInfo,
      keyPrefix: serviceKey.substring(0, 20) + "...",
    };

    // Try to create admin client
    if (serviceKey && serviceKey.length > 100) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );

        // Try simple query first - get current user (should fail gracefully)
        const { data: sessionData } = await supabaseAdmin.auth.getSession();
        
        // Try to list users (requires service_role)
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
        
        if (error) {
          return NextResponse.json({
            ...checks,
            adminClientWorks: false,
            errorCode: error.status,
            errorMessage: error.message,
            hint: keyInfo === "anon" 
              ? "Bạn đang dùng anon key! Cần dùng service_role key"
              : "Kiểm tra lại service_role key trong Supabase Dashboard",
          });
        }

        return NextResponse.json({
          ...checks,
          adminClientWorks: true,
          totalAuthUsers: data?.users?.length || 0,
          message: "✅ Supabase Auth Admin is working!",
        });
      } catch (err) {
        return NextResponse.json({
          ...checks,
          adminClientWorks: false,
          error: String(err),
        });
      }
    }

    return NextResponse.json({
      ...checks,
      adminClientWorks: false,
      error: "SUPABASE_SERVICE_ROLE_KEY not set or too short",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

