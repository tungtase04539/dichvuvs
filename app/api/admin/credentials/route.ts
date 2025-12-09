import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Encryption key - should be in env variables
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
    return text; // Return original if decryption fails
  }
}

// Get all credentials for a service
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    const where = serviceId ? { serviceId } : {};

    const credentials = await prisma.productCredential.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, icon: true } },
        order: { select: { id: true, orderCode: true, customerName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Decrypt for display
    const decryptedCredentials = credentials.map((cred) => ({
      ...cred,
      accountInfo: decrypt(cred.accountInfo),
      password: decrypt(cred.password),
      apiKey: cred.apiKey ? decrypt(cred.apiKey) : null,
    }));

    return NextResponse.json({ credentials: decryptedCredentials });
  } catch (error) {
    console.error("Get credentials error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new credential
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, accountInfo, password, apiKey, notes } = body;

    if (!serviceId || !accountInfo || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Check service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 400 });
    }

    // Encrypt sensitive data
    const credential = await prisma.productCredential.create({
      data: {
        serviceId,
        accountInfo: encrypt(accountInfo),
        password: encrypt(password),
        apiKey: apiKey ? encrypt(apiKey) : null,
        notes: notes || null,
      },
      include: {
        service: { select: { id: true, name: true, icon: true } },
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
    console.error("Create credential error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

