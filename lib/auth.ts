import { createServerSupabaseClient } from "./supabase-server";
import prisma from "./prisma";

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: unknown;
}

// Lấy session từ Supabase Auth (thống nhất một hệ thống)
export async function getSession(): Promise<UserPayload | null> {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Logic đồng bộ: Đảm bảo user có trong database Prisma
    // Điều này quan trọng cho các user mới đăng nhập qua OAuth hoặc được tạo qua Admin API mà chưa có trong bảng User
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email || "" }
    });

    if (!dbUser) {
      // Tự động tạo record trong database Prisma nếu chưa có
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          role: user.user_metadata?.role || "customer",
          password: "", // Không cần password cho Supabase Auth users trong Prisma
        }
      });
    }

    let finalRole = dbUser.role;
    if (dbUser.email === "admin@admin.com") {
      finalRole = "admin";
    }

    return {
      id: dbUser.id,
      email: dbUser.email || "",
      name: dbUser.name,
      role: finalRole,
    };
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

// Kiểm tra quyền Admin
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Safety bypass cho admin@admin.com
  if (session.email === "admin@admin.com") return true;

  return session.role === "admin";
}

// Kiểm tra quyền vào trang quản trị (Admin, Staff, Agent, CTV)
export async function isStaff(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  if (session.email === "admin@admin.com") return true;

  return ["admin", "staff", "master_agent", "agent", "collaborator", "ctv"].includes(session.role);
}

// Kiểm tra quyền Đối tác (Agent, CTV)
export async function isPartner(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  return ["master_agent", "agent", "collaborator", "ctv"].includes(session.role);
}

// Các hàm cũ sẽ trả ra null/empty vì không sử dụng nữa
export async function signToken(payload: UserPayload): Promise<string> {
  return "";
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  return null;
}

export async function setSession(token: string): Promise<void> {
  // Supabase Auth manages cookies automatically
}

export async function clearSession(): Promise<void> {
  // Logout will use supabase.auth.signOut() from the client/server
}
