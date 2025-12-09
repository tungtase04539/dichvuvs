import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/quan-tri-vien-dang-nhap");
  }

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

