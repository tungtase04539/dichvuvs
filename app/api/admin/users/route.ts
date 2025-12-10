import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Get users
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    // Build where clause based on current user's role
    let where: Record<string, unknown> = {};

    if (user.role === "admin") {
      // Admin can see all users
      if (role) {
        where = { role };
      }
    } else if (user.role === "master_agent") {
      // Master agent can only see their sub-agents
      where = { parentId: user.id };
    } else {
      // Others can't access this endpoint
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        active: true,
        createdAt: true,
        parent: {
          select: { name: true, email: true },
        },
        referralLinks: {
          select: {
            code: true,
            clickCount: true,
            orderCount: true,
            revenue: true,
          },
        },
        _count: {
          select: { subAgents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create user (agent/master_agent)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, role, parentId, createReferral } = body;

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (!["master_agent", "agent", "collaborator", "staff"].includes(role)) {
      return NextResponse.json(
        { error: "Loại tài khoản không hợp lệ" },
        { status: 400 }
      );
    }

    // CTV bắt buộc phải có parent (đại lý)
    if (role === "collaborator" && !parentId) {
      return NextResponse.json(
        { error: "Cộng tác viên bắt buộc phải thuộc một Đại lý" },
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

    // Validate parent if provided
    if (parentId) {
      const parent = await prisma.user.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json(
          { error: "Cấp trên không tồn tại" },
          { status: 400 }
        );
      }
      
      // Validate hierarchy
      if (role === "agent" && parent.role !== "master_agent") {
        return NextResponse.json(
          { error: "Đại lý chỉ có thể thuộc Tổng đại lý" },
          { status: 400 }
        );
      }
      
      if (role === "collaborator" && parent.role !== "agent") {
        return NextResponse.json(
          { error: "Cộng tác viên chỉ có thể thuộc Đại lý" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
        parentId: parentId || null,
      },
    });

    // Create referral link if requested
    let referralLink = null;
    if (createReferral && ["master_agent", "agent", "collaborator"].includes(role)) {
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
            userId: newUser.id,
          },
        });
      }
    }

    return NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      referralLink,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

