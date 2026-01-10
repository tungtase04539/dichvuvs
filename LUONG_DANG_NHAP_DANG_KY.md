# LUỒNG ĐĂNG NHẬP & ĐĂNG KÝ CTV

## 1. KIẾN TRÚC HỆ THỐNG

### Hai hệ thống lưu trữ user:
1. **Supabase Auth (`auth.users`)**: Lưu thông tin đăng nhập (email, password hash)
2. **Prisma/PostgreSQL (`public.User`)**: Lưu thông tin business (role, phone, balance, referral...)

### Quy tắc password:
- `admin@admin.com`: password = `admin` (plain text trong cột password của bảng User, nhưng thực tế đăng nhập qua Supabase Auth)
- Các tài khoản khác: password = **số điện thoại** (lưu trong Supabase Auth, cột password trong bảng User để trống hoặc là số điện thoại)

---

## 2. LUỒNG ĐĂNG KÝ CTV

### Bước 1: User điền form đăng ký tại `/tuyen-ctv`
```
Nhập: Họ tên, Số điện thoại, Email
```

### Bước 2: API `/api/ctv/apply` xử lý
```typescript
// 1. Validate dữ liệu
// 2. Tạo user trong bảng User (nếu chưa có)
await prisma.user.create({
  data: {
    email,
    name: fullName,
    phone,
    password: "",  // EMPTY - không dùng cho auth
    role: "customer"
  }
});

// 3. Tạo đơn đăng ký CTVApplication
await prisma.cTVApplication.create({
  data: { userId, fullName, phone, email, status: "pending" }
});
```

### Bước 3: Admin duyệt đơn tại `/admin/ctv-duyet`

### Bước 4: API `/api/admin/ctv/approve` xử lý
```typescript
// 1. Tạo tài khoản trong Supabase Auth
await supabaseAdmin.auth.admin.createUser({
  email: application.email,
  password: application.phone,  // PASSWORD = SỐ ĐIỆN THOẠI
  email_confirm: true,
  user_metadata: { role: "collaborator", phone, name }
});

// 2. Cập nhật role trong bảng User
await prisma.user.update({
  where: { id: application.userId },
  data: { role: "collaborator" }
});

// 3. Tự động tạo referral link
await createReferralLinkForUser(application.userId);
```

---

## 3. LUỒNG ĐĂNG NHẬP

### Trang đăng nhập:
- Khách hàng: `/dang-nhap`
- CTV/Đại lý/Admin: `/quan-tri-vien-dang-nhap`

### Xử lý đăng nhập:
```typescript
// 1. Gọi Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// 2. Supabase Auth kiểm tra trong bảng auth.users
// 3. Nếu thành công, trả về session token

// 4. Lấy thông tin user từ bảng User (Prisma)
const dbUser = await prisma.user.findUnique({ where: { email } });

// 5. Redirect theo role
if (dbUser.role === "admin" || dbUser.role === "collaborator") {
  router.push("/admin");
} else {
  router.push("/tai-khoan");
}
```

---

## 4. VẤN ĐỀ VỚI TÀI KHOẢN TEST

### Nguyên nhân không đăng nhập được:
- Các tài khoản test được tạo **CHỈ trong bảng User** (Prisma)
- **KHÔNG được tạo trong auth.users** (Supabase Auth)
- Khi đăng nhập, Supabase Auth không tìm thấy user → lỗi

### Giải pháp:
Chạy SQL trong file `sql/fix-test-auth-v2.sql` để tạo tài khoản trong Supabase Auth

---

## 5. THÔNG TIN ĐĂNG NHẬP TEST

| Email | Password | Role | Ghi chú |
|-------|----------|------|---------|
| admin@admin.com | admin | admin | Tài khoản admin chính |
| npp@test.com | 0901000001 | distributor | Nhà phân phối |
| agent1@test.com | 0902000001 | agent | Đại lý 1 (thuộc NPP) |
| agent2@test.com | 0902000002 | agent | Đại lý 2 (thuộc NPP) |
| agent3@test.com | 0902000003 | agent | Đại lý 3 (thuộc NPP) |
| ctv1@test.com | 0903000001 | collaborator | CTV 1 (thuộc Agent 1) |
| ctv2@test.com | 0903000002 | collaborator | CTV 2 (thuộc Agent 1) |
| ctv3@test.com | 0903000003 | collaborator | CTV 3 (thuộc Agent 1) |

---

## 6. CẤU TRÚC PHÂN CẤP

```
NPP (npp@test.com)
├── Đại lý 1 (agent1@test.com)
│   ├── CTV 1 (ctv1@test.com)
│   ├── CTV 2 (ctv2@test.com)
│   └── CTV 3 (ctv3@test.com)
├── Đại lý 2 (agent2@test.com)
└── Đại lý 3 (agent3@test.com)
```

---

## 7. CHECKLIST KIỂM TRA

- [ ] Chạy SQL `sql/fix-test-auth-v2.sql` trong Supabase SQL Editor
- [ ] Test đăng nhập admin@admin.com tại `/quan-tri-vien-dang-nhap`
- [ ] Test đăng nhập ctv1@test.com với password 0903000001
- [ ] Test đăng ký CTV mới tại `/tuyen-ctv`
- [ ] Test approve CTV tại `/admin/ctv-duyet`
- [ ] Verify referral link được tạo tự động sau khi approve
