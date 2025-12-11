import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: dbUser } = await supabase
      .from("User")
      .select("role")
      .eq("email", user.email)
      .single();

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Chỉ admin mới có quyền reset" }, { status: 403 });
    }

    // Delete in order (respect foreign keys)
    
    // 1. Delete ReferralClicks
    await supabase.from("ReferralClick").delete().neq("id", "");
    
    // 2. Delete ReferralLinks (except admin's)
    const { data: adminUsers } = await supabase
      .from("User")
      .select("id")
      .eq("role", "admin");
    const adminIds = adminUsers?.map(u => u.id) || [];
    
    if (adminIds.length > 0) {
      await supabase.from("ReferralLink").delete().not("userId", "in", `(${adminIds.join(",")})`);
    } else {
      await supabase.from("ReferralLink").delete().neq("id", "");
    }
    
    // 3. Delete Messages
    await supabase.from("Message").delete().neq("id", "");
    
    // 4. Delete ChatSessions
    await supabase.from("ChatSession").delete().neq("id", "");
    
    // 5. Delete ProductCredential assignments (not the credentials themselves)
    await supabase.from("ProductCredential").update({ isUsed: false, orderId: null }).neq("id", "");
    
    // 6. Delete Orders
    await supabase.from("Order").delete().neq("id", "");
    
    // 7. Delete CTVApplications
    await supabase.from("CTVApplication").delete().neq("id", "");
    
    // 8. Delete Users (except admin)
    await supabase.from("User").delete().neq("role", "admin");

    // 9. Delete auth users (except admin) - using service role
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all auth users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    // Get admin emails
    const { data: adminEmails } = await supabase
      .from("User")
      .select("email")
      .eq("role", "admin");
    const adminEmailList = adminEmails?.map(u => u.email) || [];

    // Delete non-admin auth users
    if (authUsers?.users) {
      for (const authUser of authUsers.users) {
        if (authUser.email && !adminEmailList.includes(authUser.email)) {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Đã reset dữ liệu thành công. Giữ lại: Admin accounts, Service/ChatBot data." 
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Lỗi khi reset dữ liệu" }, { status: 500 });
  }
}

