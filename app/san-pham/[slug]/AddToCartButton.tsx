"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleAddToCart = () => {
    // Save to session storage
    const cart = [{ id: product.id, quantity }];
    sessionStorage.setItem("cart", JSON.stringify(cart));
    router.push("/dat-hang");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Số lượng:</span>
        <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-bold text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="btn btn-primary w-full text-lg py-4"
      >
        <ShoppingCart className="w-5 h-5" />
        Mua ngay
      </button>

      <button
        onClick={handleAddToCart}
        className="btn btn-secondary w-full"
      >
        Thêm vào giỏ hàng
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
