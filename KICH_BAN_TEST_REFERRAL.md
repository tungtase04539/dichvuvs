# KỊCH BẢN TEST HỆ THỐNG REFERRAL

## Thông tin test
- **URL**: https://dichvuvs-3.vercel.app (hoặc localhost:3000)
- **Ngày test**: _______________

---

## PHẦN 1: CHUẨN BỊ

### Tài khoản test
| Email | Password | Role | Mã ref |
|-------|----------|------|--------|
| agent1@test.com | 0902000001 | Đại lý | _______ |
| ctv1@test.com | 0903000001 | CTV | _______ |
| npp@test.com | 0901000001 | NPP | _______ |

### Bước chuẩn bị
1. [ ] Đăng nhập `agent1@test.com` → vào Dashboard CTV → copy mã ref
2. [ ] Ghi lại mã ref: `REF-__________`
3. [ ] Kiểm tra clickCount hiện tại: _______ clicks

---

## PHẦN 2: TEST CLICK TRACKING

### Test 2.1: Click link referral (Tab ẩn danh)
**Mục đích**: Kiểm tra hệ thống track click khi user click vào link ref

**Các bước:**
1. [ ] Mở tab ẩn danh (Ctrl+Shift+N)
2. [ ] Truy cập: `https://dichvuvs-3.vercel.app?ref=REF-XXXXXX` (thay bằng mã ref thật)
3. [ ] Đợi trang load xong (2-3 giây)

**Kiểm tra:**
4. [ ] Mở DevTools (F12) → Application → Local Storage
5. [ ] Tìm key `chatbotvn_ref`
6. [ ] **KẾT QUẢ**: 
   - [ ] ✅ PASS: Có data với `code` = mã ref đã nhập
   - [ ] ❌ FAIL: Không có data hoặc code sai

**Kiểm tra clickCount:**
7. [ ] Đăng nhập lại `agent1@test.com` → Dashboard CTV
8. [ ] **KẾT QUẢ clickCount**:
   - [ ] ✅ PASS: clickCount tăng lên 1
   - [ ] ❌ FAIL: clickCount không đổi

---

### Test 2.2: Click link sản phẩm với ref
**Mục đích**: Kiểm tra ref tracking khi click link sản phẩm cụ thể

**Các bước:**
1. [ ] Mở tab ẩn danh MỚI
2. [ ] Truy cập: `https://dichvuvs-3.vercel.app/san-pham/ten-san-pham?ref=REF-XXXXXX`

**Kiểm tra:**
3. [ ] Local Storage có `chatbotvn_ref` với đúng mã ref
4. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

### Test 2.3: Ghi đè mã ref
**Mục đích**: Kiểm tra khi click link ref khác, mã mới ghi đè mã cũ

**Các bước:**
1. [ ] Trong cùng tab ẩn danh (đã có ref của agent1)
2. [ ] Truy cập link ref của CTV khác: `?ref=REF-YYYYYY`

**Kiểm tra:**
3. [ ] Local Storage `chatbotvn_ref` có `code` = mã ref MỚI
4. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

## PHẦN 3: TEST ĐẶT HÀNG VỚI REFERRAL

### Test 3.1: Đặt hàng qua link ref
**Mục đích**: Kiểm tra đơn hàng được gắn đúng referralCode và referrerId

**Các bước:**
1. [ ] Mở tab ẩn danh
2. [ ] Truy cập: `https://dichvuvs-3.vercel.app?ref=REF-XXXXXX` (ref của agent1)
3. [ ] Vào trang Đặt hàng
4. [ ] Điền thông tin:
   - Tên: Test Referral
   - SĐT: 0999888777
   - Email: test@referral.com
   - Chọn sản phẩm bất kỳ
5. [ ] Nhấn Đặt hàng

**Kiểm tra (Đăng nhập Admin):**
6. [ ] Vào Admin → Đơn hàng → Tìm đơn vừa tạo
7. [ ] Kiểm tra đơn hàng có:
   - [ ] `referralCode` = REF-XXXXXX
   - [ ] `referrerId` = ID của agent1
8. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

### Test 3.2: Đặt hàng KHÔNG có ref
**Mục đích**: Kiểm tra đơn hàng không có ref thì không gắn referrer

**Các bước:**
1. [ ] Mở tab ẩn danh MỚI (không click link ref)
2. [ ] Truy cập trực tiếp: `https://dichvuvs-3.vercel.app/dat-hang`
3. [ ] Đặt 1 đơn hàng

**Kiểm tra:**
4. [ ] Đơn hàng có `referralCode` = null
5. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

## PHẦN 4: TEST TÍNH HOA HỒNG

### Test 4.1: Xác nhận đơn → Tính commission
**Mục đích**: Kiểm tra khi Admin xác nhận đơn, hệ thống tự động tính hoa hồng

**Điều kiện**: Đã có đơn hàng với referralCode từ Test 3.1

**Các bước:**
1. [ ] Đăng nhập Admin
2. [ ] Vào Đơn hàng → Tìm đơn có referralCode
3. [ ] Ghi lại giá trị đơn: ____________ đ
4. [ ] Nhấn "Xác nhận" đơn hàng

**Kiểm tra:**
5. [ ] Đăng nhập `agent1@test.com`
6. [ ] Vào Dashboard CTV → Hoa hồng
7. [ ] Kiểm tra có commission mới với:
   - [ ] Số tiền = 15% của giá trị đơn (vì agent = 15%)
   - [ ] Status = pending
8. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

**Tính toán:**
- Giá trị đơn: ____________ đ
- Hoa hồng kỳ vọng (15%): ____________ đ
- Hoa hồng thực tế: ____________ đ
- **Khớp**: ✅ / ❌

---

### Test 4.2: Commission cho CTV (10%)
**Mục đích**: Kiểm tra CTV nhận đúng 10% hoa hồng

**Các bước:**
1. [ ] Lấy mã ref của `ctv1@test.com`
2. [ ] Tab ẩn danh → click link ref CTV
3. [ ] Đặt 1 đơn hàng
4. [ ] Admin xác nhận đơn

**Kiểm tra:**
5. [ ] Đăng nhập `ctv1@test.com` → Dashboard
6. [ ] Hoa hồng = 10% giá trị đơn
7. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

### Test 4.3: Commission cho NPP (20%)
**Mục đích**: Kiểm tra NPP nhận đúng 20% hoa hồng

**Các bước:**
1. [ ] Lấy mã ref của `npp@test.com`
2. [ ] Tab ẩn danh → click link ref NPP
3. [ ] Đặt 1 đơn hàng
4. [ ] Admin xác nhận đơn

**Kiểm tra:**
5. [ ] Đăng nhập `npp@test.com` → Dashboard
6. [ ] Hoa hồng = 20% giá trị đơn
7. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

## PHẦN 5: TEST THỜI HẠN REF (30 NGÀY)

### Test 5.1: Kiểm tra expiry trong localStorage
**Mục đích**: Xác nhận ref được lưu với thời hạn 30 ngày

**Các bước:**
1. [ ] Mở tab ẩn danh → click link ref
2. [ ] DevTools → Application → Local Storage
3. [ ] Xem `chatbotvn_ref` → kiểm tra field `expiry`

**Kiểm tra:**
4. [ ] `expiry` = timestamp hiện tại + 30 ngày (2592000000 ms)
5. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

## PHẦN 6: TEST COPY LINK TỪ DASHBOARD

### Test 6.1: Copy link từ Dashboard CTV
**Các bước:**
1. [ ] Đăng nhập `agent1@test.com`
2. [ ] Vào Dashboard CTV
3. [ ] Nhấn nút "Copy link"

**Kiểm tra:**
4. [ ] Paste link ra → có dạng `https://domain.com?ref=REF-XXXXXX`
5. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

### Test 6.2: Copy link sản phẩm từ trang Sản phẩm
**Các bước:**
1. [ ] Vào Admin → Sản phẩm
2. [ ] Nhấn nút copy link ref của 1 sản phẩm

**Kiểm tra:**
3. [ ] Link có dạng `https://domain.com/san-pham/slug?ref=REF-XXXXXX`
4. [ ] **KẾT QUẢ**: ✅ PASS / ❌ FAIL

---

## TỔNG KẾT

| Test | Kết quả | Ghi chú |
|------|---------|---------|
| 2.1 Click tracking | ✅/❌ | |
| 2.2 Link sản phẩm | ✅/❌ | |
| 2.3 Ghi đè ref | ✅/❌ | |
| 3.1 Đặt hàng có ref | ✅/❌ | |
| 3.2 Đặt hàng không ref | ✅/❌ | |
| 4.1 Commission Đại lý 15% | ✅/❌ | |
| 4.2 Commission CTV 10% | ✅/❌ | |
| 4.3 Commission NPP 20% | ✅/❌ | |
| 5.1 Expiry 30 ngày | ✅/❌ | |
| 6.1 Copy link Dashboard | ✅/❌ | |
| 6.2 Copy link sản phẩm | ✅/❌ | |

**Tổng**: ___/11 tests passed

---

## LỖI PHÁT HIỆN (nếu có)

| # | Mô tả lỗi | Bước gặp lỗi | Mức độ |
|---|-----------|--------------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## GHI CHÚ THÊM

_Ghi lại các quan sát, đề xuất cải thiện..._
