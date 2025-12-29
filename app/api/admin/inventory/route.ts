import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Get inventory for a product
export async function GET(
    request: NextRequest
) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get("serviceId");

        if (!serviceId) {
            return NextResponse.json({ error: "Thiếu serviceId" }, { status: 400 });
        }

        const adminSupabase = createAdminSupabaseClient();
        if (!adminSupabase) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }

        // Fetch service to get its chatbotLink
        let service: any;
        let sError: any;

        const initialRes = await adminSupabase
            .from("Service")
            .select("id, name, chatbotLink")
            .eq("id", serviceId)
            .single();

        service = initialRes.data;
        sError = initialRes.error;

        // Resilience: if chatbotLink column is missing, retry without it
        if (sError && sError.message?.includes("chatbotLink") && (sError.message?.includes("column") || sError.message?.includes("cache"))) {
            console.warn("Retrying fetch without chatbotLink due to missing column");
            const { data: retryService, error: retryError } = await adminSupabase
                .from("Service")
                .select("id, name")
                .eq("id", serviceId)
                .single();

            service = retryService;
            sError = retryError;
        }

        if (sError) console.error("Get service error:", sError);

        // Fetch inventory
        const { data: inventory, error: iError } = await adminSupabase
            .from("ChatbotInventory")
            .select(`
                *,
                order:Order(orderCode, customerName)
            `)
            .eq("serviceId", serviceId)
            .order("createdAt", { ascending: false });

        if (iError) console.error("Get inventory inventory error:", iError);

        return NextResponse.json({ service, inventory });
    } catch (error) {
        console.error("Get inventory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Add new inventory item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serviceId, activationCode } = body;

        if (!serviceId || !activationCode) {
            return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
        }

        const adminSupabase = createAdminSupabaseClient();
        if (!adminSupabase) return NextResponse.json({ error: "Database connection failed" }, { status: 500 });

        const { data: newItem, error } = await adminSupabase
            .from("ChatbotInventory")
            .insert({
                id: crypto.randomUUID(),
                serviceId,
                activationCode,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Add inventory error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ item: newItem });
    } catch (error) {
        console.error("Add inventory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Update service chatbot link
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { serviceId, chatbotLink } = body;

        if (!serviceId) {
            return NextResponse.json({ error: "Thiếu serviceId" }, { status: 400 });
        }

        const adminSupabase = createAdminSupabaseClient();
        if (!adminSupabase) return NextResponse.json({ error: "Database connection failed" }, { status: 500 });

        const { error } = await adminSupabase
            .from("Service")
            .update({
                chatbotLink,
                updatedAt: new Date().toISOString()
            })
            .eq("id", serviceId);

        if (error) {
            console.error("Update chatbot link error:", error);
            // Resilience: if column is missing, return success but log warning
            if (error.message?.includes("chatbotLink") && (error.message?.includes("column") || error.message?.includes("cache"))) {
                console.warn("Skipping chatbotLink update due to missing column");
                return NextResponse.json({
                    success: true,
                    warning: "Cột chatbotLink chưa tồn tại trong Database. Vui lòng chạy lệnh SQL đã được hướng dẫn."
                });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update chatbot link error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Delete inventory item
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
        }

        const adminSupabase = createAdminSupabaseClient();
        if (!adminSupabase) return NextResponse.json({ error: "Database connection failed" }, { status: 500 });

        const { error } = await adminSupabase
            .from("ChatbotInventory")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Delete inventory error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete inventory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
