import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, facebook, zalo, experience, reason } = body;

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ họ tên, số điện thoại và email" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("User")
      .select("id, role")
      .eq("email", email)
      .single();

    let userId: string;

    if (existingUser) {
      // Check if already applied
      const { data: existingApp } = await supabase
        .from("CTVApplication")
        .select("id, status")
        .eq("userId", existingUser.id)
        .single();

      if (existingApp) {
        if (existingApp.status === "pending") {
          return NextResponse.json(
            { error: "Bạn đã gửi đơn đăng ký CTV, vui lòng chờ duyệt" },
            { status: 400 }
          );
        }
        if (existingApp.status === "approved") {
          return NextResponse.json(
            { error: "Bạn đã là CTV" },
            { status: 400 }
          );
        }
      }

      if (existingUser.role === "ctv") {
        return NextResponse.json(
          { error: "Bạn đã là CTV" },
          { status: 400 }
        );
      }

      userId = existingUser.id;
    } else {
      // Create new user with customer role
      const { data: newUser, error: userError } = await supabase
        .from("User")
        .insert({
          email,
          password: phone, // Mật khẩu = số điện thoại
          name,
          phone,
          role: "customer",
        })
        .select("id")
        .single();

      if (userError) {
        console.error("Error creating user:", userError);
        return NextResponse.json(
          { error: "Không thể tạo tài khoản" },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // Create CTV application
    const { error: appError } = await supabase
      .from("CTVApplication")
      .insert({
        userId,
        fullName: name,
        phone,
        email,
        facebook,
        zalo,
        experience,
        reason,
        status: "pending",
      });

    if (appError) {
      console.error("Error creating application:", appError);
      return NextResponse.json(
        { error: "Không thể gửi đơn đăng ký" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h.",
    });
  } catch (error) {
    console.error("CTV registration error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

