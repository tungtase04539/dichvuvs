import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Health check endpoint - keeps function warm
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Quick query to keep connection alive
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 500 }
    );
  }
}

