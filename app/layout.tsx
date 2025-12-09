import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VệSinhHCM - Dịch vụ vệ sinh chuyên nghiệp",
  description: "Dịch vụ vệ sinh nhà ở, văn phòng, công nghiệp chuyên nghiệp tại TP.HCM. Đặt lịch nhanh chóng, giá cả hợp lý.",
  keywords: ["vệ sinh", "dọn dẹp", "giặt ghế", "vệ sinh điều hòa", "TP.HCM"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="font-sans">{children}</body>
    </html>
  );
}

