"use client";

import { useState } from "react";
import { Link2, Check, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CopyRefButtonProps {
  productSlug?: string;
  productId?: string;
  variant?: "icon" | "button" | "full";
  className?: string;
}

export default function CopyRefButton({
  productSlug,
  productId,
  variant = "button",
  className = "",
}: CopyRefButtonProps) {
  const { user, isCTV, isAdmin, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Only show for CTV or Admin with referral code
  if (isLoading || (!isCTV && !isAdmin) || !user?.referralCode) {
    return null;
  }

  const generateRefLink = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    if (productSlug) {
      // Link to specific product with ref code
      return `${baseUrl}/san-pham/${productSlug}?ref=${user.referralCode}`;
    } else if (productId) {
      // Link to order page with product pre-selected
      return `${baseUrl}/dat-hang?product=${productId}&ref=${user.referralCode}`;
    } else {
      // General referral link
      return `${baseUrl}?ref=${user.referralCode}`;
    }
  };

  const handleCopy = async () => {
    const link = generateRefLink();
    
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors ${className}`}
        title={copied ? "Đã copy!" : "Copy link giới thiệu"}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === "full") {
    return (
      <div className={`bg-gradient-to-r from-primary-50 to-yellow-50 border border-primary-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-primary-700">Link giới thiệu của bạn</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={generateRefLink()}
            readOnly
            className="flex-1 bg-white border border-primary-200 rounded-lg px-3 py-2 text-sm text-slate-600 truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              copied
                ? "bg-green-500 text-white"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Đã copy!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Mã giới thiệu: <span className="font-mono font-bold text-primary-600">{user.referralCode}</span>
        </p>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
        copied
          ? "bg-green-500 text-white"
          : "bg-gradient-to-r from-primary-500 to-yellow-500 text-white hover:from-primary-600 hover:to-yellow-600 shadow-lg hover:shadow-xl"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Đã copy link!
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          Copy link giới thiệu
        </>
      )}
    </button>
  );
}

