# VệSinhHCM - Ứng dụng Dịch vụ Vệ sinh

Ứng dụng web dịch vụ vệ sinh chuyên nghiệp với đầy đủ tính năng quản lý.

## Tính năng

### Cho khách hàng
- ✅ Xem danh sách dịch vụ và bảng giá
- ✅ Đặt lịch dịch vụ không cần đăng nhập
- ✅ Tra cứu đơn hàng bằng mã và số điện thoại
- ✅ Chat trực tiếp với nhân viên hỗ trợ (không cần đăng nhập)
- ✅ Giao diện responsive, thân thiện mobile

### Cho Admin/Nhân viên
- ✅ Trang đăng nhập ẩn (`/quan-tri-vien-dang-nhap`)
- ✅ Dashboard thống kê: đơn hàng, doanh thu, biểu đồ
- ✅ Quản lý đơn hàng: xem, xác nhận, cập nhật trạng thái
- ✅ Chat với khách hàng real-time
- ✅ Phân quyền Admin/Staff

## Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Khởi tạo database

```bash
npx prisma db push
```

### Bước 3: Seed dữ liệu mẫu

```bash
npm run db:seed
```

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Tài khoản mẫu

### Admin
- Email: `admin@vesinhhcm.vn`
- Password: `admin123`

### Nhân viên
- Email: `nhanvien1@vesinhhcm.vn`
- Password: `staff123`

## Cấu trúc thư mục

```
├── app/
│   ├── admin/           # Trang quản trị
│   │   ├── components/  # Components cho admin
│   │   ├── chat/        # Quản lý chat
│   │   ├── don-hang/    # Quản lý đơn hàng
│   │   └── page.tsx     # Dashboard
│   ├── api/             # API routes
│   │   ├── auth/        # Đăng nhập, đăng xuất
│   │   ├── chat/        # Chat API
│   │   └── orders/      # Đơn hàng API
│   ├── bang-gia/        # Trang bảng giá
│   ├── dat-lich/        # Trang đặt lịch
│   ├── tra-cuu/         # Tra cứu đơn hàng
│   ├── quan-tri-vien-dang-nhap/  # Trang đăng nhập ẩn
│   └── page.tsx         # Trang chủ
├── components/          # Components dùng chung
├── lib/                 # Utilities
├── prisma/              # Database schema và seed
└── public/              # Static files
```

## Công nghệ sử dụng

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Auth**: JWT với jose

## Các trang chính

| Đường dẫn | Mô tả |
|-----------|-------|
| `/` | Trang chủ |
| `/bang-gia` | Bảng giá dịch vụ |
| `/dat-lich` | Đặt lịch dịch vụ |
| `/tra-cuu` | Tra cứu đơn hàng |
| `/quan-tri-vien-dang-nhap` | Đăng nhập admin (ẩn) |
| `/admin` | Dashboard admin |
| `/admin/don-hang` | Quản lý đơn hàng |
| `/admin/chat` | Quản lý chat |

## Môi trường Production

### Cấu hình Supabase Database

1. Vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project > **Project Settings** > **Database**
3. Scroll xuống **Connection string** > chọn tab **URI**
4. Copy connection strings:

**Environment Variables cần thiết:**

```env
# Transaction connection (pooled) - Port 6543
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection - Port 5432 (cho migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# JWT Secret
JWT_SECRET="your-super-secret-key-change-this"
```

### Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Chọn Framework: **Next.js**
4. Thêm Environment Variables (DATABASE_URL, DIRECT_URL, JWT_SECRET)
5. Deploy!

Để build cho production:

```bash
npm run build
npm start
```

## Lưu ý

- Trang đăng nhập được ẩn tại URL `/quan-tri-vien-dang-nhap` để bảo mật
- Chat polling mỗi 3 giây để cập nhật tin nhắn mới
- Database sử dụng SQLite, file lưu tại `prisma/dev.db`

## License

MIT License

