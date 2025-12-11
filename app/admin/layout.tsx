import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  
  if (!supabase) {
    redirect("/quan-tri-vien-dang-nhap");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/quan-tri-vien-dang-nhap");
  }

  // Get user data from database (for correct role)
  const { data: dbUser } = await supabase
    .from("User")
    .select("id, name, role")
    .eq("email", user.email)
    .single();

  const userRole = dbUser?.role || "customer";

  // Chỉ cho phép admin, ctv (đã duyệt), staff vào admin panel
  // customer chuyển tới trang tài khoản riêng
  const allowedRoles = ["admin", "ctv", "staff", "master_agent", "agent", "collaborator"];
  if (!allowedRoles.includes(userRole)) {
    redirect("/tai-khoan");
  }

  // Get user metadata
  const session = {
    id: user.id,
    email: user.email || "",
    name: dbUser?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Admin",
    role: userRole,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar user={session} />
      <div className="lg:pl-64">
        <AdminHeader user={session} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
