"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateOrderCode } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import VideoModal from "@/components/VideoModal";
import { Plus, Minus, Trash2, ShoppingCart, User, Phone, Mail, MessageSquare, Loader2, Gift, Play, Search, ChevronLeft, ChevronRight, Bot } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  videoUrl: string | null;
  slug: string;
  description: string | null;
  featured: boolean;
}

interface CartItem {
  product: Product & {
    priceGold?: number | null;
    pricePlatinum?: number | null;
  };
  quantity: number;
  packageType: string;
}

export default function OrderForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: "", title: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name && !customerName) setCustomerName(user.name);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [isAuthenticated, user]);

  // Filtered products based on search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const openVideoModal = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.videoUrl) {
      setVideoModal({
        isOpen: true,
        url: product.videoUrl,
        title: `${product.name} - Video Demo`,
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, settingsRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/admin/settings", { cache: "no-store" })
        ]);

        const prodData = await prodRes.json();
        const settingsData = await settingsRes.json();

        if (prodData.products) setProducts(prodData.products);
        if (settingsData.settings) setGlobalSettings(settingsData.settings);
      } catch (error) {
        console.error("Load data error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const cartData = sessionStorage.getItem("cart");
      if (cartData) {
        try {
          const items = JSON.parse(cartData);
          const cartItems: CartItem[] = [];
          items.forEach((item: { id: string; quantity: number; packageType?: string }) => {
            const product = products.find((p) => p.id === item.id);
            if (product) {
              cartItems.push({
                product,
                quantity: item.quantity,
                packageType: item.packageType || "standard"
              });
            }
          });
          if (cartItems.length > 0) setCart(cartItems);
          sessionStorage.removeItem("cart");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [products]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.packageType === "standard");
      if (existing) {
        return prev.map((item) =>
          (item.product.id === product.id && item.packageType === "standard") ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, packageType: "standard" }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    let price = item.product.price;
    if (item.packageType === "gold") {
      price = globalSettings.price_gold ? parseFloat(globalSettings.price_gold) : (item.product.priceGold || price * 1.5);
    } else if (item.packageType === "platinum") {
      price = globalSettings.price_platinum ? parseFloat(globalSettings.price_platinum) : (item.product.pricePlatinum || price * 2.5);
    } else if (item.packageType === "standard") {
      price = globalSettings.price_standard ? parseFloat(globalSettings.price_standard) : price;
    }
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Vui lòng chọn ít nhất 1 Trợ lý AI");
      return;
    }

    setIsSubmitting(true);

    try {
      const items = cart.map((item) => ({
        serviceId: item.product.id,
        quantity: item.quantity,
        packageType: item.packageType
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone: phone,
          email,
          notes,
          items,
          referralCode: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Có lỗi xảy ra, vui lòng thử lại");
        setIsSubmitting(false);
        return;
      }

      router.push(`/dat-hang/thanh-cong?code=${data.order.orderCode}`);
    } catch (error) {
      console.error("Order error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form & Cart */}
        <div className="flex-1 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              Thông tin nhận tài khoản
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Địa chỉ Email (Tùy chọn)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                  placeholder="your@email.com (Để tạo tài khoản quản lý)"
                />
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2">
                  <Gift className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Tài khoản Trợ lý AI sẽ được tạo qua <strong>Email</strong> này. Mật khẩu mặc định là <strong>Số điện thoại</strong> của bạn.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Ghi chú (Tùy chọn)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Yêu cầu thêm hoặc ghi chú đơn hàng..."
                />
              </div>

              <p className="text-[11px] text-slate-400 italic">
                <span className="text-red-500">*</span> Thông tin bắt buộc phải nhập
              </p>
            </div>
          </div>

          {/* Cart Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                </div>
                Trợ lý AI đã chọn
              </div>
              {totalItems > 0 && (
                <span className="text-sm font-medium text-slate-400">{totalItems} bot</span>
              )}
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                <Bot className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">Bạn chưa chọn Trợ lý AI nào</p>
                <p className="text-xs text-slate-300 mt-1">Hãy xem các gợi ý bên cạnh 👉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      {item.product.image ? (
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🤖</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 truncate">{item.product.name}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${item.packageType === 'gold' ? 'bg-amber-500/10 text-amber-600 border-amber-200' :
                          item.packageType === 'platinum' ? 'bg-cyan-500/10 text-cyan-600 border-cyan-200' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                          GÓI {item.packageType === 'gold' ? 'VÀNG (GOLD)' :
                            item.packageType === 'platinum' ? 'BẠCH KIM (PLATINUM)' :
                              'TIÊU CHUẨN'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary-600 font-bold">
                          {formatCurrency(
                            item.packageType === 'gold' ? (globalSettings.price_gold ? parseFloat(globalSettings.price_gold) : (item.product.priceGold || item.product.price * 1.5)) :
                              item.packageType === 'platinum' ? (globalSettings.price_platinum ? parseFloat(globalSettings.price_platinum) : (item.product.pricePlatinum || item.product.price * 2.5)) :
                                (globalSettings.price_standard ? parseFloat(globalSettings.price_standard) : item.product.price)
                          )}
                        </span>
                        <span className="text-slate-300">/tháng</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-md transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Suggestions & Total */}
        <div className="lg:w-[360px] space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary-500/10">
            <h2 className="text-lg font-bold mb-6 text-primary-400 uppercase tracking-wider">Tóm tắt đơn hàng</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400">
                <span>Số lượng Trợ lý AI</span>
                <span className="font-bold text-white">{totalItems}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Thời hạn</span>
                <span className="font-bold text-white">1 Tháng</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <span className="text-slate-400 pb-1">Tổng cộng</span>
                <span className="text-3xl font-bold text-primary-400">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-slate-900 font-bold rounded-2xl shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 uppercase tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Xác nhận đơn hàng
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-4 px-4">
              Bằng việc đặt hàng, bạn đồng ý với các Điều khoản & Chính sách của chúng tôi.
            </p>
          </div>

          {/* Suggestions Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-500" />
              Gợi ý Trợ lý AI khác
            </h3>

            <div className="space-y-3">
              {products
                .filter(p => !cart.find(c => c.product.id === p.id))
                .slice(0, 5)
                .map(product => (
                  <div
                    key={product.id}
                    className="group flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100"
                    onClick={() => addToCart(product)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-primary-600 font-bold">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              {products.length > 5 && (
                <button
                  type="button"
                  className="w-full py-2 text-xs font-bold text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                >
                  Xem thêm tất cả Trợ lý AI
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
        youtubeUrl={videoModal.url}
        title={videoModal.title}
      />
    </form>
  );
}
