"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, generateOrderCode } from "@/lib/supabase";
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

export default function OrderForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load products DIRECTLY from Supabase - NO serverless delay!
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("Service")
        .select("id, name, slug, description, price, icon, featured")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("name");

      if (!error && data) {
        setProducts(data);
      }
      setIsLoading(false);
    };

    // Check sessionStorage for pre-selected cart
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      sessionStorage.setItem("pendingCart", savedCart);
      sessionStorage.removeItem("cart");
    }

    loadProducts();
  }, []);

  // Populate cart when products loaded
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
          if (cartItems.length > 0) {
            setCart(cartItems);
          }
          sessionStorage.removeItem("pendingCart");
        } catch (e) {
          console.error("Error loading pending cart:", e);
        }
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
    const orderCode = generateOrderCode();
    const mainProduct = cart[0].product;
    const details = cart.map((item) => `${item.product.name} x${item.quantity}`).join(", ");

    // Insert DIRECTLY to Supabase - INSTANT!
    const { error } = await supabase.from("Order").insert({
      id: crypto.randomUUID(),
      orderCode,
      serviceId: mainProduct.id,
      quantity: totalItems,
      unit: "bot",
      customerName,
      customerPhone: phone,
      customerEmail: email || null,
      address: "Online",
      district: "Online",
      scheduledDate: new Date().toISOString(),
      scheduledTime: "Giao ngay",
      notes: notes ? `${notes}\n---\n${details}` : details,
      basePrice: mainProduct.price,
      totalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (error) {
      console.error("Order error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
      setIsSubmitting(false);
      return;
    }

    router.push(`/dat-hang/thanh-cong?code=${orderCode}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

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
            <h2 className="text-xl font-bold mb-4">Giỏ hàng ({totalItems})</h2>

            {cart.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Chọn sản phẩm bên trái
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                  >
                    <span className="text-xl">{item.product.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-purple-400 text-xs">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="pt-3 border-t border-white/10 flex justify-between font-bold">
                  <span>Tổng:</span>
                  <span className="text-purple-400">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Thông tin</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                  <User className="w-4 h-4" />
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                  <Phone className="w-4 h-4" />
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
