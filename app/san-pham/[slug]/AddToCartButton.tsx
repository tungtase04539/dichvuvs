"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  icon: string | null;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleBuyNow = () => {
    // Store in sessionStorage for checkout
    const cart = [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        icon: product.icon,
      },
    ];
    sessionStorage.setItem("cart", JSON.stringify(cart));
    router.push("/dat-hang");
  };

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-slate-400">Số lượng:</span>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-l-xl transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-bold text-xl">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-r-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between py-4 border-t border-white/10">
        <span className="text-slate-400">Tổng tiền:</span>
        <span className="text-3xl font-bold text-purple-400">
          {formatCurrency(product.price * quantity)}
        </span>
      </div>

      {/* Buy button */}
      <button
        onClick={handleBuyNow}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300"
      >
        <ShoppingCart className="w-5 h-5" />
        Mua ngay - {formatCurrency(product.price * quantity)}
      </button>
    </div>
  );
}

