import { createServerSupabaseClient } from "./supabase-server";

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

    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      role: user.user_metadata?.role || "staff",
    };
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

// Các hàm cũ giữ lại để không break code khác (nhưng không dùng)
export async function signToken(payload: UserPayload): Promise<string> {
  // Không dùng nữa - Supabase Auth quản lý token
  return "";
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  // Không dùng nữa
  return null;
}

export async function setSession(token: string): Promise<void> {
  // Không dùng nữa - Supabase Auth quản lý session
}

export async function clearSession(): Promise<void> {
  // Logout sẽ dùng supabase.auth.signOut()
}
