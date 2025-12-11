import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function CustomerLayout({
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

  // Get user data from database
  const { data: dbUser } = await supabase
    .from("User")
    .select("id, name, role, email, phone")
    .eq("email", user.email)
    .single();

  // Admin/CTV goes to admin panel
  const adminRoles = ["admin", "ctv", "staff", "master_agent", "agent", "collaborator"];
  if (dbUser?.role && adminRoles.includes(dbUser.role)) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header settings={{}} />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer settings={{}} />
    </div>
  );
}

