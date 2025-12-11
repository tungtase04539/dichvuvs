"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Link2,
  Check,
  Copy,
  ShoppingBag,
  Loader2,
  Star,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  icon: string | null;
  featured: boolean;
}

interface UserInfo {
  referralCode: string | null;
}

export default function CTVProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }

        // Fetch user info for referral code
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const data = await userRes.json();
          setUserInfo(data.user);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search)
    );
  });

  const getRefLink = (product: Product) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/san-pham/${product.slug}?ref=${userInfo?.referralCode || ""}`;
  };

  const handleCopyLink = async (product: Product) => {
    const link = getRefLink(product);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(product.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(product.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="text-slate-500 mt-1">
            Copy link giới thiệu để chia sẻ và kiếm hoa hồng
          </p>
        </div>
        {userInfo?.referralCode && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
            <span className="text-sm text-slate-600">Mã giới thiệu của bạn: </span>
            <span className="font-mono font-bold text-primary-600">{userInfo.referralCode}</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{product.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">
                        {product.name}
                      </h3>
                      {product.featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-slate-400 text-sm">/tháng</span>
                </div>
              </div>

              {/* Referral Link Section */}
              <div className="p-4 bg-slate-50">
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">
                  Link giới thiệu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={getRefLink(product)}
                    readOnly
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 truncate"
                  />
                  <button
                    onClick={() => handleCopyLink(product)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shrink-0 ${
                      copiedId === product.id
                        ? "bg-green-500 text-white"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    }`}
                  >
                    {copiedId === product.id ? (
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

              {/* Actions */}
              <div className="p-4 flex gap-2">
                <Link
                  href={`/san-pham/${product.slug}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Xem chi tiết
                </Link>
                <button
                  onClick={() => handleCopyLink(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-yellow-500 text-white rounded-lg hover:from-primary-600 hover:to-yellow-600 transition-all font-medium"
                >
                  <Link2 className="w-4 h-4" />
                  Copy link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-primary-50 to-yellow-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="font-bold text-primary-700 mb-3">💡 Mẹo tăng doanh thu</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Chia sẻ link giới thiệu lên Facebook, Zalo, TikTok...</li>
          <li>• Viết bài review sản phẩm kèm link giới thiệu</li>
          <li>• Gửi cho bạn bè, người thân có nhu cầu</li>
          <li>• Tham gia các group kinh doanh online</li>
        </ul>
      </div>
    </div>
  );
}

