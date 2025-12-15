import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const body = await request.json();
    const { action, rejectReason, reviewer } = body;

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const payload: Record<string, any> = {
      status: action,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewer || null,
      rejectReason: action === "rejected" ? rejectReason || null : null,
    };

    const { data, error } = await supabase
      .from("CTVApplication")
      .update(payload)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error("Update CTV application error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

