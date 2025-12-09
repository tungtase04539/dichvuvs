import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    // Test password for each user
    const results = await Promise.all(
      users.map(async (user) => {
        const testPassword = user.role === "admin" ? "admin123" : "staff123";
        const isValid = await bcrypt.compare(testPassword, user.password);
        
        return {
          email: user.email,
          role: user.role,
          passwordHash: user.password.substring(0, 20) + "...",
          hashLength: user.password.length,
          testPassword: testPassword,
          passwordValid: isValid,
        };
      })
    );

    return NextResponse.json({ users: results });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

