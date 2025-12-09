import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Warm up endpoint - call every 5 minutes to prevent cold start
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  
  try {
    // Warm up database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Pre-load common data into memory
    await Promise.all([
      prisma.service.findMany({ 
        where: { active: true },
        select: { id: true, name: true },
        take: 10,
      }),
      prisma.setting.findMany({
        where: { key: { in: ["site_name", "site_phone", "bank_account"] } },
      }),
    ]);

    const duration = Date.now() - start;
    
    return NextResponse.json({ 
      status: "warm",
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", duration: `${Date.now() - start}ms` },
      { status: 500 }
    );
  }
}

