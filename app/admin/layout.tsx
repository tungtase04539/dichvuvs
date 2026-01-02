import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  // HARDCODED SAFETY: Always allow admin@admin.com to access admin panel
  let role = dbUser?.role || user.user_metadata?.role;
  if (user.email === "admin@admin.com") {
    role = "admin";
  }

  // STRICT ACCESS CONTROL: Only admin, staff, and partners can access /admin
  const allowedRoles = ["admin", "staff", "collaborator", "ctv", "agent", "master_agent"];
  if (!role || !allowedRoles.includes(role)) {
    console.warn(`[AdminLayout] Unauthorized access attempt by user ${user.email}. Metadata Role: ${user.user_metadata?.role}, DB Role: ${dbUser?.role}`);
    redirect("/tai-khoan");
  }

  const session = {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    role: role,
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
