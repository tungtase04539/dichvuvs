import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import ReferralTracker from "@/components/ReferralTracker";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "ChatBotVN - Mua ChatBot AI chỉ 29K/tháng",
  description: "Mua ChatBot AI tự động trả lời khách hàng 24/7. Tăng doanh số, tiết kiệm chi phí. Chỉ 29K/chatbot AI/tháng.",
  keywords: ["chatbot", "AI", "tự động", "bán hàng", "chăm sóc khách hàng"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="font-sans">
        <AuthProvider>
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
