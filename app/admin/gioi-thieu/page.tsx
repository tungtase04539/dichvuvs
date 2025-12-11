"use client";

import { useState, useEffect } from "react";
import { Link2, MousePointer, ShoppingCart, DollarSign, TrendingUp, Users, Copy, Check, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReferralLink {
  id: string;
  code: string;
  clickCount: number;
  orderCount: number;
  revenue: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface UserInfo {
  id: string;
  role: string;
  referralCode: string | null;
}

export default function ReferralsPage() {
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isAdmin = userInfo?.role === "admin";
  const isCTV = userInfo?.role === "ctv" || userInfo?.role === "collaborator";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserInfo(userData.user);
        }

        // Get referral links
        const refRes = await fetch("/api/admin/referrals");
        if (refRes.ok) {
          const refData = await refRes.json();
          setReferralLinks(refData.referralLinks || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyLink = async (code: string) => {
    const link = `${window.location.origin}?ref=${code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate stats
  const totalClicks = referralLinks.reduce((sum, l) => sum + l.clickCount, 0);
  const totalOrders = referralLinks.reduce((sum, l) => sum + l.orderCount, 0);
  const totalRevenue = referralLinks.reduce((sum, l) => sum + l.revenue, 0);
  const conversionRate = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {isAdmin ? "Quản lý Mã giới thiệu" : "Mã giới thiệu của bạn"}
        </h1>
        <p className="text-slate-600">
          {isAdmin ? "Theo dõi hiệu quả của các mã giới thiệu" : "Copy link và chia sẻ để kiếm hoa hồng"}
        </p>
      </div>

      {/* CTV: Show their referral code prominently */}
      {isCTV && userInfo?.referralCode && (
        <div className="bg-gradient-to-r from-primary-500 to-yellow-500 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-80 mb-1">Mã giới thiệu của bạn</p>
              <p className="text-3xl font-bold font-mono">{userInfo.referralCode}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => copyLink(userInfo.referralCode!)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  copied 
                    ? "bg-green-500 text-white" 
                    : "bg-white text-primary-600 hover:bg-white/90"
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Đã copy!" : "Copy link giới thiệu"}
              </button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm font-mono truncate">
              {typeof window !== "undefined" ? `${window.location.origin}?ref=${userInfo.referralCode}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Lượt click</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalOrders.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Đơn hàng</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-slate-500">Doanh thu</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
              <p className="text-sm text-slate-500">Tỷ lệ chuyển đổi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin: Show all referral links */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Danh sách mã giới thiệu</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Mã</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Người sở hữu</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Click</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Đơn hàng</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referralLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono font-medium text-primary-600">
                        {link.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{link.user.name}</p>
                      <p className="text-xs text-slate-500">{link.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-900">{link.clickCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-green-600">{link.orderCount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-primary-600">{formatCurrency(link.revenue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {referralLinks.length === 0 && (
              <div className="text-center py-12">
                <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Chưa có mã giới thiệu nào</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTV: Tips section */}
      {isCTV && (
        <div className="bg-gradient-to-r from-primary-50 to-yellow-50 rounded-2xl p-6 border border-primary-100">
          <h3 className="font-bold text-primary-700 mb-3">💡 Cách kiếm tiền với mã giới thiệu</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Chia sẻ link giới thiệu lên Facebook, Zalo, TikTok...</li>
            <li>• Gửi cho bạn bè, người thân có nhu cầu sử dụng ChatBot</li>
            <li>• Viết bài review sản phẩm kèm link giới thiệu</li>
            <li>• Tham gia các group kinh doanh online để chia sẻ</li>
            <li>• Khách mua hàng trong 7 ngày sau khi click link sẽ được tính cho bạn</li>
          </ul>
        </div>
      )}
    </div>
  );
}
