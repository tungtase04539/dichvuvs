import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    const serviceCount = await prisma.service.count();
    const settingCount = await prisma.setting.count();

    return NextResponse.json({
      status: "connected",
      counts: {
        users: userCount,
        services: serviceCount,
        settings: settingCount,
      },
      users: users,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

