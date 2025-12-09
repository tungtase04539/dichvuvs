import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", email });
    }

    // Show password hash from DB (first 20 chars for debug)
    const hashPreview = user.password.substring(0, 30) + "...";
    
    // Test bcrypt compare
    const isValid = await bcrypt.compare(password, user.password);
    
    // Generate new hash for comparison
    const newHash = await bcrypt.hash(password, 10);

    return NextResponse.json({
      userFound: true,
      email: user.email,
      storedHashPreview: hashPreview,
      storedHashLength: user.password.length,
      passwordProvided: password,
      bcryptCompareResult: isValid,
      newlyGeneratedHash: newHash,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

