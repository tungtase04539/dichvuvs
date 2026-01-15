import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Bank configuration - set these in Vercel Environment Variables
const BANK_ACCOUNT = process.env.SEPAY_BANK_ACCOUNT || "0123456789";
const BANK_NAME = process.env.SEPAY_BANK_NAME || "MB";
const BANK_OWNER = process.env.SEPAY_BANK_OWNER || "CHATBOT VN STORE";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get("amount") || "30000";
    const content = searchParams.get("content") || "";

    // Add SEVQR prefix for VietinBank compatibility (required by SePay)
    // Format: SEVQR [OrderCode]
    const paymentContent = content.startsWith("SEVQR") ? content : `SEVQR ${content}`;

    // Generate SePay QR URL directly (no DB call needed)
    // Format: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=CONTENT
    const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_NAME}&amount=${amount}&des=${encodeURIComponent(paymentContent)}&template=compact`;

    return NextResponse.json({
      success: true,
      qrUrl,
      bankName: BANK_NAME,
      accountNumber: BANK_ACCOUNT,
      accountName: BANK_OWNER,
      amount: parseInt(amount),
      content: paymentContent, // Return the content with SEVQR prefix
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
