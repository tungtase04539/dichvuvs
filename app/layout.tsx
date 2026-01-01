import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import ReferralTracker from "@/components/ReferralTracker";

export const metadata: Metadata = {
  title: "Trợ lý AI VN - Sở hữu Trợ lý AI chỉ 29K/tháng",
  description: "Mua Trợ lý AI tự động trả lời khách hàng 24/7. Tăng doanh số, tiết kiệm chi phí. Chỉ 29K/trợ lý AI/tháng.",
  keywords: ["trợ lý AI", "AI", "tự động", "bán hàng", "chăm sóc khách hàng"],
};

import FloatingButtons from "@/components/FloatingButtons";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="font-sans">
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        {children}
        <FloatingButtons />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
