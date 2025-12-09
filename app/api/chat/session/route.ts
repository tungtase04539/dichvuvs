import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, guestName, guestPhone } = body;

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID is required" }, { status: 400 });
    }

    // Find or create chat session
    let session = await prisma.chatSession.findUnique({
      where: { guestId },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          guestId,
          guestName: guestName || "Khách",
          guestPhone,
          status: "active",
        },
      });

      // Add welcome message
      await prisma.message.create({
        data: {
          chatSessionId: session.id,
          senderType: "system",
          senderName: "Hệ thống",
          content: `Xin chào ${guestName || "bạn"}! Cảm ơn bạn đã liên hệ với VệSinhHCM. Nhân viên của chúng tôi sẽ hỗ trợ bạn trong giây lát.`,
        },
      });
    } else {
      // Update session info if provided
      if (guestName || guestPhone) {
        session = await prisma.chatSession.update({
          where: { id: session.id },
          data: {
            guestName: guestName || session.guestName,
            guestPhone: guestPhone || session.guestPhone,
            lastActivity: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Chat session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

