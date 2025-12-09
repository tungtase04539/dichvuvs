"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus, Trash2, ShoppingCart, User, Phone, Mail, MessageSquare, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  icon: string | null;
  slug: string;
  description: string | null;
  featured: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function OrderForm({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Load cart from sessionStorage
  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        const cartItems: CartItem[] = [];
        items.forEach((item: { id: string; quantity: number }) => {
          const product = products.find((p) => p.id === item.id);
          if (product) {
            cartItems.push({ product, quantity: item.quantity });
          }
        });
        if (cartItems.length > 0) {
          setCart(cartItems);
        }
        sessionStorage.removeItem("cart");
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  }, [products]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ChatBot");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email: email || undefined,
          notes: notes || undefined,
          items: cart.map((item) => ({
            serviceId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            details: item.product.name,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        router.push(`/dat-hang/thanh-cong?code=${data.order.orderCode}`);
      } else {
        alert(data.error || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            Chọn ChatBot
          </h2>

          <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {products.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    inCart
                      ? "bg-purple-500/20 border-purple-500"
                      : "bg-white/5 border-white/10 hover:border-purple-500/50"
                  }`}
                  onClick={() => addToCart(product)}
                >
                  <div className="text-3xl mb-2">{product.icon}</div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-purple-400 font-bold text-sm">
                    {formatCurrency(product.price)}
                  </p>
                  {inCart && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, -1);
                        }}
                        className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold">{inCart.quantity}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, 1);
                        }}
                        className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-6">
          {/* Cart Summary */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Giỏ hàng ({totalItems} sản phẩm)</h2>

            {cart.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Chưa có sản phẩm nào trong giỏ hàng
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                  >
                    <div className="text-2xl">{item.product.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-purple-400 text-sm">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng tiền:</span>
                    <span className="text-purple-400">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Thông tin khách hàng</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <User className="w-4 h-4" />
                  Họ tên <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Mail className="w-4 h-4" />
                  Email (không bắt buộc)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  placeholder="Yêu cầu đặc biệt, nền tảng muốn tích hợp..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Đặt hàng - {formatCurrency(totalPrice)}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

