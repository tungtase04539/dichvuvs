import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from("Category")
      .select("id, name, slug")
      .order("order");

    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }

    // Get all services with their category
    const { data: services, error: svcError } = await supabase
      .from("Service")
      .select("id, name, slug, categoryId, active")
      .eq("active", true);

    if (svcError) {
      return NextResponse.json({ error: svcError.message }, { status: 500 });
    }

    // Count services by category
    const categoryCounts: Record<string, number> = {};
    const unassigned: string[] = [];

    services?.forEach((service) => {
      if (service.categoryId) {
        const category = categories?.find((c) => c.id === service.categoryId);
        if (category) {
          categoryCounts[category.slug] = (categoryCounts[category.slug] || 0) + 1;
        } else {
          unassigned.push(service.slug);
        }
      } else {
        unassigned.push(service.slug);
      }
    });

    return NextResponse.json({
      categories: categories || [],
      totalServices: services?.length || 0,
      categoryCounts,
      unassignedServices: unassigned,
      services: services?.map((s) => ({
        name: s.name,
        slug: s.slug,
        categoryId: s.categoryId,
        hasCategory: !!s.categoryId,
      })),
    });
  } catch (error: any) {
    console.error("Debug categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

