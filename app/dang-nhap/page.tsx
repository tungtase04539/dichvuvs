"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email hoặc mật khẩu không đúng");
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Đăng nhập thất bại");
        setIsLoading(false);
        return;
      }

      // Get user role from database
      const { data: dbUser } = await supabase
        .from("User")
        .select("role")
        .eq("email", authData.user.email)
        .single();

      // Redirect based on role
      if (dbUser?.role === "admin" || dbUser?.role === "ctv" || dbUser?.role === "collaborator") {
        router.push("/admin");
      } else if (dbUser?.role === "customer") {
        router.push("/tai-khoan");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang chủ
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-slate-900" />
            </div>
            <span className="text-2xl font-bold text-white uppercase tracking-tighter">
              Sàn trợ lý <span className="text-primary-400">AI</span>
            </span>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Đăng nhập
          </h1>
          <p className="text-slate-400 text-center text-sm mb-6">
            Đăng nhập để quản lý tài khoản của bạn
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-400 text-slate-900 font-bold rounded-xl hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-slate-400">
              Chưa có tài khoản?{" "}
              <Link href="/dat-hang" className="text-primary-400 hover:text-primary-300 font-medium">
                Mua Trợ lý AI để nhận tài khoản
              </Link>
            </p>
            <p className="text-center text-xs text-slate-500 mt-2">
              Hoặc{" "}
              <Link href="/quan-tri-vien-dang-nhap" className="text-primary-400 hover:text-primary-300 font-bold uppercase">
                Đăng nhập đối tác (CTV)
              </Link>
            </p>
          </div>
        </div>

        {/* Help */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Cần hỗ trợ?{" "}
          <a href="tel:0345501969" className="text-primary-400 hover:text-primary-300">
            0345 501 969
          </a>
        </p>
      </div>
    </div>
  );
}

