"use client";

import { useState, useEffect } from "react";
import {
  Link2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Package,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  featured: boolean;
}

interface ReferralLink {
  code: string;
  clickCount: number;
  orderCount: number;
  revenue: number;
}

export default function ReferralLinksPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [refCode, setRefCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkStats, setLinkStats] = useState<ReferralLink | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products and referral code in parallel
      const [productsRes, statsRes] = await Promise.all([
        fetch("/api/products?limit=100"),
        fetch("/api/ctv/stats"),
      ]);

      const productsData = await productsRes.json();
      const statsData = await statsRes.json();

      setProducts(productsData.products || []);
      
      // Get referral code from stats
      if (statsData.referral?.links?.[0]) {
        setRefCode(statsData.referral.links[0].code);
        setLinkStats(statsData.referral.links[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReferralLink = async () => {
    try {
      const res = await fetch("/api/referral", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.referralLink) {
          setRefCode(data.referralLink.code);
        }
        fetchData();
      }
    } catch (error) {
      console.error("Error creating referral link:", error);
    }
  };

  const copyLink = async (type: "home" | "product" | "package", slug?: string) => {
    let url = window.location.origin;
    
    if (type === "home") {
      url = `${url}?ref=${refCode}`;
    } else if (type === "product" && slug) {
      url = `${url}/san-pham/${slug}?ref=${refCode}`;
    } else if (type === "package") {
      url = `${url}/goi?ref=${refCode}`;
    }

    await navigator.clipboard.writeText(url);
    setCopiedId(type === "product" ? slug! : type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!refCode) {
    return (
      <div className="text-center py-16">
        <Link2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa có link giới thiệu</h2>
        <p className="text-slate-500 mb-6">Tạo link để bắt đầu kiếm hoa hồng</p>
        <button onClick={createReferralLink} className="btn btn-primary">
          <Link2 className="w-5 h-5" />
          Tạo link giới thiệu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Link giới thiệu</h1>
        <p className="text-slate-500 mt-1">
          Chia sẻ link để nhận hoa hồng khi khách hàng mua hàng
        </p>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Mã giới thiệu của bạn</p>
            <p className="text-3xl font-black mt-2 font-mono tracking-wider">{refCode}</p>
            <div className="flex items-center gap-4 mt-4 text-primary-100 text-sm">
              <span>{linkStats?.clickCount || 0} lượt click</span>
              <span>•</span>
              <span>{linkStats?.orderCount || 0} đơn hàng</span>
              <span>•</span>
              <span>{formatCurrency(linkStats?.revenue || 0)} doanh thu</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Link2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Link nhanh
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Home Link */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">🏠 Trang chủ</span>
              <button
                onClick={() => copyLink("home")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  copiedId === "home"
                    ? "bg-green-100 text-green-700"
                    : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                }`}
              >
                {copiedId === "home" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Đã copy
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy link
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-500 truncate">
              {window.location.origin}?ref={refCode}
            </p>
          </div>

          {/* Package Link */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-amber-700">📦 Trang gói dịch vụ</span>
              <button
                onClick={() => copyLink("package")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  copiedId === "package"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                {copiedId === "package" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Đã copy
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy link
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-amber-600 truncate">
              {window.location.origin}/goi?ref={refCode}
            </p>
          </div>
        </div>
      </div>

      {/* Product Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary-500" />
          Link theo sản phẩm
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">🤖</span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {product.name}
                      {product.featured && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          HOT
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-primary-600 font-medium">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/san-pham/${product.slug}?ref=${refCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Xem trang"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => copyLink("product", product.slug)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      copiedId === product.slug
                        ? "bg-green-100 text-green-700"
                        : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                    }`}
                  >
                    {copiedId === product.slug ? (
                      <>
                        <Check className="w-4 h-4" />
                        Đã copy
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-3">💡 Mẹo chia sẻ hiệu quả</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Chia sẻ link <strong>trang gói dịch vụ</strong> để khách dễ so sánh và chọn gói phù hợp</li>
          <li>• Link <strong>trang chủ</strong> phù hợp khi giới thiệu tổng quan về dịch vụ</li>
          <li>• Link <strong>sản phẩm cụ thể</strong> khi bạn biết khách cần gì</li>
          <li>• Hoa hồng sẽ được tính khi khách thanh toán thành công</li>
        </ul>
      </div>
    </div>
  );
}
