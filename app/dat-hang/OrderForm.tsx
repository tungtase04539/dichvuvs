"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateOrderCode } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import VideoModal from "@/components/VideoModal";
import { Plus, Minus, Trash2, ShoppingCart, User, Phone, Mail, MessageSquare, Loader2, Gift, Play, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  product: Product;
  quantity: number;
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
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Load products error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const pendingCart = sessionStorage.getItem("pendingCart");
      if (pendingCart) {
        try {
          const items = JSON.parse(pendingCart);
          const cartItems: CartItem[] = [];
          items.forEach((item: { id: string; quantity: number }) => {
            const product = products.find((p) => p.id === item.id);
            if (product) {
              cartItems.push({ product, quantity: item.quantity });
            }
          });
          if (cartItems.length > 0) setCart(cartItems);
          sessionStorage.removeItem("pendingCart");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [products]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
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
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ChatBot");
      return;
    }

    if (!email) {
      alert("Vui lòng nhập email để nhận tài khoản quản lý ChatBot");
      return;
    }

    setIsSubmitting(true);

    try {
      const items = cart.map((item) => ({
        serviceId: item.product.id,
        quantity: item.quantity,
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        {/* Product Selection */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              Chọn ChatBot
            </h2>
            <span className="text-xs sm:text-sm text-slate-500">{products.length} sản phẩm</span>
          </div>

          {/* Search */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm ChatBot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Product Grid - Mobile: 2 cols scrollable, Desktop: horizontal scroll */}
          <div className="relative">
            {/* Navigation Arrows - Hidden on mobile */}
            <button
              type="button"
              onClick={scrollLeft}
              className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full items-center justify-center hover:bg-primary-50 transition-all border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>

            <button
              type="button"
              onClick={scrollRight}
              className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full items-center justify-center hover:bg-primary-50 transition-all border border-slate-200"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>

            {/* Mobile: Grid layout, Desktop: Horizontal scroll */}
            <div
              ref={scrollContainerRef}
              className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:overflow-x-auto sm:pb-2 sm:px-6 sm:snap-x sm:snap-mandatory scroll-smooth max-h-[50vh] sm:max-h-none overflow-y-auto sm:overflow-y-visible"
              style={{ scrollbarWidth: "thin" }}
            >
              {filteredProducts.map((product) => {
                const inCart = cart.find((item) => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    className={`sm:flex-shrink-0 sm:w-36 rounded-xl border-2 cursor-pointer transition-all overflow-hidden snap-start ${inCart
                        ? "bg-primary-50 border-primary-500 shadow-md"
                        : "bg-slate-50 border-transparent hover:border-primary-200 active:scale-95"
                      }`}
                    onClick={() => addToCart(product)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl sm:text-4xl">🤖</span>
                        </div>
                      )}
                      {inCart && (
                        <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg">
                          {inCart.quantity}
                        </div>
                      )}
                      {/* Video Demo Overlay */}
                      {product.videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => openVideoModal(e, product)}
                          className="absolute bottom-1 left-1 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded hover:bg-black/90 transition-colors"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          Demo
                        </button>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-2">
                      <h3 className="font-medium text-slate-900 text-[11px] sm:text-xs mb-0.5 line-clamp-2 min-h-[2rem]">{product.name}</h3>
                      <p className="text-primary-600 font-bold text-xs sm:text-sm">{formatCurrency(product.price)}</p>

                      {/* Quantity Controls */}
                      {inCart && (
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, -1);
                            }}
                            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center active:bg-red-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-900 w-4 text-center text-xs">{inCart.quantity}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, 1);
                            }}
                            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center active:bg-green-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* No results */}
          {filteredProducts.length === 0 && (
            <p className="text-center text-slate-500 py-6 text-sm">Không tìm thấy ChatBot phù hợp</p>
          )}
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-4 sm:space-y-6">
          {/* Cart Summary */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center justify-between">
              <span>🛒 Giỏ hàng</span>
              {totalItems > 0 && (
                <span className="text-sm font-normal bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {totalItems} sản phẩm
                </span>
              )}
            </h2>

            {cart.length === 0 ? (
              <p className="text-slate-500 text-center py-6 text-sm">Chọn sản phẩm ở trên ☝️</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.image ? (
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg sm:text-xl">🤖</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-primary-600 text-xs font-semibold">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="pt-2 sm:pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-900 text-sm sm:text-base">Tổng cộng:</span>
                  <span className="text-lg sm:text-xl font-bold text-primary-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">📝 Thông tin khách hàng</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="input text-sm"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="input text-sm"
                    placeholder="0912345678"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input text-sm"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                  <span>⚠️</span>
                  <span>Email dùng làm <strong>tên đăng nhập</strong>, mật khẩu là <strong>số điện thoại</strong> của bạn để quản lý ChatBot đã mua.</span>
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input resize-none text-sm"
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button - Sticky on mobile */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 px-4 py-3 sm:relative sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent border-t sm:border-0 border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="btn btn-primary w-full text-base sm:text-lg py-3 sm:py-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Đặt hàng {totalPrice > 0 && `- ${formatCurrency(totalPrice)}`}
                </>
              )}
            </button>
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
