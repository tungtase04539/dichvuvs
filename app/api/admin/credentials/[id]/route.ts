import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key!!";
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}

// Update credential
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountInfo, password, apiKey, notes } = body;

    if (!accountInfo || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const credential = await prisma.productCredential.update({
      where: { id: params.id },
      data: {
        accountInfo: encrypt(accountInfo),
        password: encrypt(password),
        apiKey: apiKey ? encrypt(apiKey) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ 
      credential: {
        ...credential,
        accountInfo,
        password,
        apiKey,
      }
    });
  } catch (error) {
    console.error("Update credential error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete credential
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credential = await prisma.productCredential.findUnique({
      where: { id: params.id },
    });

    if (!credential) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    if (credential.isUsed) {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản đã gán cho đơn hàng" },
        { status: 400 }
      );
    }

    await prisma.productCredential.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete credential error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

