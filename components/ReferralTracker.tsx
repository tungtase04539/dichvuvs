"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const REF_STORAGE_KEY = "chatbotvn_ref";
const REF_EXPIRY_DAYS = 30;

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    
    if (refCode) {
      // Lưu mã ref vào localStorage với thời hạn 30 ngày
      const refData = {
        code: refCode,
        expiry: Date.now() + REF_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(refData));

      // Track click
      trackReferralClick(refCode);
    }
  }, [searchParams]);

  return null;
}

// Track referral click (không cần đăng nhập)
async function trackReferralClick(code: string) {
  try {
    await fetch("/api/referral/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  } catch (error) {
    console.error("Track referral error:", error);
  }
}

// Helper function để lấy mã ref hiện tại từ localStorage
export function getCurrentReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(REF_STORAGE_KEY);
    if (!stored) return null;

    const refData = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > refData.expiry) {
      localStorage.removeItem(REF_STORAGE_KEY);
      return null;
    }

    return refData.code;
  } catch {
    return null;
  }
}

// Helper để clear ref sau khi đặt hàng thành công (optional)
export function clearReferralCode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REF_STORAGE_KEY);
}

