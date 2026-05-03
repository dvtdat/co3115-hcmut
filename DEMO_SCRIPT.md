# 🎬 Kịch Bản Demo - Electronic Store System (CO3115 HCMUT)

> **Hướng dẫn quay clip demo End-to-End toàn bộ hệ thống.**
> Thời lượng ước tính: **8–10 phút.**
> **Luồng chính:** Admin kiểm tra hệ thống & tạo sản phẩm mới ➔ Khách hàng thấy sản phẩm, đặt mua ➔ Admin nhận đơn hàng và xử lý.

---

## 📋 Thông Tin Tài Khoản

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| **Admin** | `admin@co3115.hcmut.edu.vn` | `Admin@123` |
| **Customer (demo)** | `user@co3115.hcmut.edu.vn` | `User@123` |

---

## 🚀 Cách Khởi Động Hệ Thống Trước Khi Quay

```bash
# Terminal 1 — Backend
cd back-end
npm run start:dev

# Terminal 2 — Frontend
cd front-end
npm run dev
```

> **Lưu ý:** Nếu database bị trống, hãy chạy `cd back-end && npm run seed` để có sẵn dữ liệu test ban đầu.

---

## 🎥 CHI TIẾT CÁC BƯỚC QUAY CLIP (THEO FLOW)

### PHẦN 1: GIAO DIỆN ADMIN (Kiểm tra hệ thống & Tạo Sản Phẩm)
*Mục đích: Chứng minh Admin quản lý được toàn bộ dữ liệu cửa hàng, có thể CRUD sản phẩm đầy đủ.*

1. **Đăng nhập Admin:** Mở `http://localhost:3000`, click **Sign In** và đăng nhập bằng tài khoản Admin.
2. **Dashboard:**
   - Khái quát các chỉ số: Total Revenue, Total Orders, bảng thống kê trạng thái.
   - Chỉ ra danh sách Recent Orders đang hiển thị.
3. **Quản lý Category:**
   - Vào **Categories**, lướt xem danh sách.
   - Thử tính năng ô Search để tìm kiếm.
4. **Quản lý Customers:**
   - Vào **Customers**, xem danh sách User.
   - Demo bật/tắt (Toggle Active) một tài khoản khách hàng.
   - Click **"View"** để xem thống kê (tổng đơn, tổng chi tiêu, lịch sử) của một khách hàng cụ thể.
5. **Tạo Sản Phẩm Mới (QUAN TRỌNG):**
   - Vào **Products**, lướt xem danh sách.
   - Bấm **"New product"** và tạo một sản phẩm cực kỳ nổi bật để lát nữa khách hàng mua (Ví dụ: *"MacBook Pro M4 Max"*).
   - Điền form: Name, Base Price, Stock, chọn Category, dán link Image URL. Bấm Create.
   - **Tạo Variants (Biến thể):** Ở sản phẩm vừa tạo, bấm icon **Layers (xếp chồng)** ở cột Actions.
   - Thêm 2 Variants với giá khác nhau (VD: bản RAM 36GB và bản RAM 128GB) để chứng minh tính năng biến thể.
6. **Đăng xuất Admin:** Click Avatar góc trên cùng bên phải -> **Log out**.

---

### PHẦN 2: GIAO DIỆN KHÁCH HÀNG (Duyệt web & Mua Sản Phẩm Vừa Tạo)
*Mục đích: Chứng minh dữ liệu đồng bộ tức thời từ Admin sang khách hàng, quy trình Checkout hoạt động trơn tru.*

1. **Khách hàng duyệt web (Guest):**
   - Lướt qua trang chủ (Homepage): Hero banner, Benefits, Testimonials.
   - Click menu **Shop** -> Phân trang và tìm thấy ngay sản phẩm *"MacBook Pro M4 Max"* mà Admin vừa tạo.
2. **Đăng nhập / Đăng ký:**
   - Khách hàng bấm vào sản phẩm sẽ thấy yêu cầu Login để mua.
   - Tiến hành **Sign In** bằng tài khoản `user@co3115.hcmut.edu.vn`. (Có thể demo thao tác **Sign Up** một tài khoản hoàn toàn mới ngay lúc đó nếu muốn tăng thời lượng).
3. **Mua hàng:**
   - Vào trang chi tiết của sản phẩm vừa tạo.
   - Thử click chọn qua lại các **Variants** để chứng minh giá có thay đổi khớp với thiết lập bên Admin.
   - Chọn số lượng, bấm **"Add to Cart"**.
4. **Checkout (Đặt hàng):**
   - Bấm icon giỏ hàng góc trên phải -> Kiểm tra thông tin, bấm **"Proceed to checkout"**.
   - **Bước 1 (Delivery):** Chọn "Home delivery". Địa chỉ sẽ tự lấy từ profile (có thể gõ thêm sửa lại). Bấm "Continue".
   - **Bước 2 (Review):** Kiểm tra lại bill tổng tiền, bấm **"Place order"**.
   - Chờ màn hình hiển thị mua hàng thành công.
5. **Kiểm tra lịch sử:**
   - Vào Profile -> **My Orders**.
   - Thấy đơn hàng vừa đặt đang nằm đó với trạng thái **Pending (màu xám)**.
6. **Đăng xuất Customer:** Click Avatar -> **Log out**.

---

### PHẦN 3: ADMIN NHẬN ĐƠN HÀNG VÀ XỬ LÝ
*Mục đích: Chứng minh đơn hàng của khách lập tức được gửi về hệ thống Admin và quy trình đổi trạng thái đơn hàng.*

1. **Đăng nhập Admin:** Đăng nhập lại bằng tài khoản Admin.
2. **Kiểm tra Dashboard:**
   - Chỉ ra **Total Orders** đã tự tăng thêm 1.
   - Đơn hàng mới nhất của khách hàng khi nãy đã lập tức xuất hiện trên cùng trong bảng **Recent Orders**.
3. **Xử lý đơn hàng (Orders):**
   - Vào tab **Orders** bên sidebar.
   - Thấy đơn hàng đang trạng thái `Pending`.
   - Bấm **"Manage"** để mở chi tiết đơn.
   - Cùng check lại thông tin: Tên khách hàng, địa chỉ giao hàng, sản phẩm (MacBook), thành tiền -> Tất cả đều chuẩn xác.
   - Bấm nút **"Mark as Confirmed"** -> Trạng thái đổi sang màu Xanh.
4. **Cập nhật luồng giao hàng:**
   - Bấm tiếp **"Mark as Shipping"**.
   - Cuối cùng bấm **"Mark as Delivered"** để hoàn tất chu trình của một đơn hàng.

---

## 🎉 KẾT THÚC DEMO

**Với Flow này, bạn có thể chứng minh được:**
✅ **Toàn vẹn dữ liệu:** Thêm sản phẩm bên admin hiện ngay bên user.
✅ **Quản lý kho chi tiết:** Hệ thống hỗ trợ xử lý Variant (nhiều giá, cấu hình) cực tốt.
✅ **Xử lý giao dịch trọn vẹn:** User đăng ký -> Thêm giỏ hàng -> Thanh toán -> Order History.
✅ **Admin Control:** Đơn hàng bắn về Admin -> Admin xem xét -> Xử lý trạng thái từ đầu tới cuối.
