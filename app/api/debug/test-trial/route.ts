// API endpoint to test if isTrial columns exist and can be updated
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const adminSupabase = createAdminSupabaseClient()!;
    
    // Get first product
    const { data: product, error: fetchError } = await adminSupabase
      .from("Service")
      .select("id, name, isTrial, trialCode")
      .limit(1)
      .single();
    
    if (fetchError) {
      return NextResponse.json({
        status: "FETCH_ERROR",
        error: fetchError.message,
        hint: fetchError.hint,
        details: fetchError.details
      });
    }

    // Try to update isTrial to true
    const { data: updated, error: updateError } = await adminSupabase
      .from("Service")
      .update({
        isTrial: true,
        trialCode: "TEST-DEBUG-" + Date.now()
      })
      .eq("id", product.id)
      .select("id, name, isTrial, trialCode")
      .single();

    if (updateError) {
      return NextResponse.json({
        status: "UPDATE_ERROR", 
        originalProduct: product,
        error: updateError.message,
        hint: updateError.hint,
        details: updateError.details,
        code: updateError.code
      });
    }

    // Fetch again to confirm
    const { data: confirm, error: confirmError } = await adminSupabase
      .from("Service")
      .select("id, name, isTrial, trialCode")
      .eq("id", product.id)
      .single();

    return NextResponse.json({
      status: "SUCCESS",
      originalProduct: product,
      updatedProduct: updated,
      confirmedProduct: confirm,
      test: "isTrial columns working correctly"
    });

  } catch (error) {
    return NextResponse.json({
      status: "EXCEPTION",
      error: String(error)
    });
  }
}
