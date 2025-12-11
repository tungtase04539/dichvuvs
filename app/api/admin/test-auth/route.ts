import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Test API để kiểm tra Supabase Auth Admin
export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 401 });
    }

    const checks = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    };

    // Try to create admin client
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Try to list users
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          return NextResponse.json({
            ...checks,
            adminClientWorks: false,
            error: error.message,
          });
        }

        return NextResponse.json({
          ...checks,
          adminClientWorks: true,
          totalAuthUsers: data?.users?.length || 0,
          message: "Supabase Auth Admin is working correctly!",
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
      error: "SUPABASE_SERVICE_ROLE_KEY not set",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

