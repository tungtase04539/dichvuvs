import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Get agent's collaborators
export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collaborators = await prisma.user.findMany({
      where: { parentId: user.id, role: "collaborator" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        active: true,
        createdAt: true,
        referralLinks: {
          select: {
            code: true,
            clickCount: true,
            orderCount: true,
            revenue: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Get collaborators error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create collaborator (by agent)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, createReferral } = body;

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Check email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create collaborator
    const collaborator = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "collaborator",
        parentId: user.id, // CTV thuộc đại lý này
      },
    });

    // Create referral link if requested
    let referralLink = null;
    if (createReferral !== false) {
      // Generate unique code
      let code: string;
      let attempts = 0;
      do {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        code = "REF-";
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const exists = await prisma.referralLink.findUnique({ where: { code } });
        if (!exists) break;
        attempts++;
      } while (attempts < 10);

      if (attempts < 10) {
        referralLink = await prisma.referralLink.create({
          data: {
            code: code!,
            userId: collaborator.id,
          },
        });
      }
    }

    return NextResponse.json({
      collaborator: {
        id: collaborator.id,
        name: collaborator.name,
        email: collaborator.email,
      },
      referralLink,
    });
  } catch (error) {
    console.error("Create collaborator error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

