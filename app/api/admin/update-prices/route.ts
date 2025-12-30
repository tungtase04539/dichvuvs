import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { price } = await request.json();
    const adminSupabase = createAdminSupabaseClient()!;

    const { error } = await adminSupabase
      .from("Service")
      .update({ price: price || 29000 })
      .neq("id", "");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Updated all prices to ${price || 29000}đ` });
  } catch (error) {
    console.error("Update prices error:", error);
    return NextResponse.json({ error: "Failed to update prices" }, { status: 500 });
  }
}
