import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");
    const sessionId = searchParams.get("sessionId");

    // If admin/staff is requesting
    const user = await getSession();
    if (user && sessionId) {
      // Mark all guest messages as read when admin views them
      await prisma.message.updateMany({
        where: {
          chatSessionId: sessionId,
          senderType: "guest",
          read: false,
        },
        data: {
          read: true,
        },
      });

      const messages = await prisma.message.findMany({
        where: { chatSessionId: sessionId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ messages });
    }

    // Guest requesting their messages
    if (!guestId) {
      return NextResponse.json({ error: "Guest ID is required" }, { status: 400 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { guestId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: session.messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, guestName, content, sessionId } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Check if admin/staff is sending
    const user = await getSession();
    if (user && sessionId) {
      // Mark all guest messages in this session as read
      await prisma.message.updateMany({
        where: {
          chatSessionId: sessionId,
          senderType: "guest",
          read: false,
        },
        data: {
          read: true,
        },
      });

      const message = await prisma.message.create({
        data: {
          chatSessionId: sessionId,
          senderId: user.id,
          senderType: user.role,
          senderName: user.name,
          content,
          read: true, // Admin's own message is already read
        },
      });

      // Update session activity
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { lastActivity: new Date() },
      });

      return NextResponse.json({ message });
    }

    // Guest sending message
    if (!guestId) {
      return NextResponse.json({ error: "Guest ID is required" }, { status: 400 });
    }

    // Find or create session
    let session = await prisma.chatSession.findUnique({
      where: { guestId },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          guestId,
          guestName: guestName || "Khách",
          status: "active",
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        chatSessionId: session.id,
        senderType: "guest",
        senderName: guestName || "Khách",
        content,
      },
    });

    // Update session activity
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

