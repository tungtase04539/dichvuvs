"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, generateOrderCode } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { getCurrentReferralCode } from "@/components/ReferralTracker";
import { Plus, Minus, Trash2, ShoppingCart, User, Phone, Mail, MessageSquare, Loader2, Gift } from "lucide-react";

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
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
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

    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      sessionStorage.setItem("pendingCart", savedCart);
      sessionStorage.removeItem("cart");
    }

    loadProducts();

    // Load referral code from localStorage
    const refCode = getCurrentReferralCode();
    if (refCode) {
      setReferralCode(refCode);
      // Validate and get referrer name
      fetch(`/api/referral/track?code=${refCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setReferrerName(data.referrerName);
          }
        })
        .catch(() => {});
    }
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

    setIsSubmitting(true);
    const supabase = getSupabase();
    if (!supabase) {
      alert("Lỗi kết nối, vui lòng thử lại");
      setIsSubmitting(false);
      return;
    }
    
    const orderCode = generateOrderCode();
    const mainProduct = cart[0].product;
    const details = cart.map((item) => `${item.product.name} x${item.quantity}`).join(", ");

    const orderData: Record<string, unknown> = {
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
    };

    // Thêm mã giới thiệu nếu có
    if (referralCode) {
      orderData.referralCode = referralCode;
    }

    const { error } = await supabase.from("Order").insert(orderData);

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
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            Chọn ChatBot
          </h2>

          <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {products.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    inCart
                      ? "bg-primary-50 border-primary-500"
                      : "bg-slate-50 border-transparent hover:border-primary-200"
                  }`}
                  onClick={() => addToCart(product)}
                >
                  <div className="text-3xl mb-2">{product.icon}</div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-primary-600 font-bold text-sm">{formatCurrency(product.price)}</p>
                  {inCart && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, -1);
                        }}
                        className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-slate-900">{inCart.quantity}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, 1);
                        }}
                        className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Giỏ hàng ({totalItems})</h2>

            {cart.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Chọn sản phẩm bên trái</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-xl">{item.product.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-primary-600 text-xs font-semibold">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin khách hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="input"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="input"
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input resize-none"
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>
          </div>

          {/* Referral Code Display */}
          {referralCode && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Mã giới thiệu đã áp dụng</p>
                  <p className="text-xs text-green-600">
                    <code className="font-mono font-bold">{referralCode}</code>
                    {referrerName && <span> - Giới thiệu bởi {referrerName}</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="btn btn-primary w-full text-lg py-4"
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
