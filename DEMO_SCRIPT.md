# 🎬 Kịch Bản Demo - Electronic Store System (CO3115 HCMUT)

> **Hướng dẫn quay clip demo toàn bộ tính năng hệ thống.**
> Thời lượng ước tính: **8–12 phút.**

---

## 📋 Thông Tin Tài Khoản

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| **Admin** | `admin@co3115.hcmut.edu.vn` | `Admin@123` |
| **Customer (demo)** | `user@co3115.hcmut.edu.vn` | `User@123` |

> Hoặc dùng tài khoản bạn đã tự đăng ký (ví dụ: `dodangkhoa250805@gmail.com`).

---

## 🚀 Cách Khởi Động Hệ Thống

```bash
# Terminal 1 — Backend (NestJS + MongoDB)
cd back-end
npm run start:dev

# Terminal 2 — Frontend (Vite + React)
cd front-end
npm run dev
```

- **Backend**: http://localhost:3300
- **Frontend**: http://localhost:3000
- **Swagger API Docs**: http://localhost:3300/api

---

## PHẦN 1: GIAO DIỆN KHÁCH HÀNG (Customer / Guest)

### 1.1 Trang Chủ (Homepage)
- Mở trình duyệt, vào `http://localhost:3000`
- **Demo các phần:**
  - ✅ Hero Section (banner giới thiệu cửa hàng)
  - ✅ Benefits Section (các ưu điểm: miễn phí vận chuyển, bảo hành...)
  - ✅ Testimonials Section (đánh giá khách hàng)
  - ✅ Header full-width với Logo, thanh điều hướng (Home, Shop, About)
  - ✅ Footer full-width

### 1.2 Đăng Ký Tài Khoản (Register)
- Click nút **"Sign Up"** trên Header
- **Điền thông tin:**
  - Email (ví dụ: `demo@test.com`)
  - Password
  - Full Name
  - Phone
- Bấm **Register** → Hệ thống tạo tài khoản, tự động tạo Shopping Cart, redirect về trang Login
- **Tính năng liên quan:** Mã hóa mật khẩu (bcrypt), mã hóa tên (AES encryption)

### 1.3 Đăng Nhập (Login)
- Nhập **Email** và **Password**
- Bấm **Log in** → Hệ thống trả về JWT Access Token + Refresh Token
- Redirect về trang chủ, Header hiển thị avatar/menu người dùng
- **Tính năng liên quan:** JWT Authentication, Auto-refresh token khi hết hạn

### 1.4 Duyệt Sản Phẩm (Shop / Products)
- Click **"Shop"** trên thanh điều hướng → Vào trang `/products`
- **Demo các tính năng:**
  - ✅ Hiển thị danh sách sản phẩm dạng Grid
  - ✅ **Phân trang (Pagination)**: Nút Prev / Next, hiển thị 10 sản phẩm/trang
  - ✅ Hiển thị tên, giá (VNĐ), ảnh sản phẩm
  - ✅ Click vào sản phẩm để xem chi tiết

### 1.5 Chi Tiết Sản Phẩm (Product Detail)
- Click vào một sản phẩm bất kỳ
- **Demo các tính năng:**
  - ✅ Breadcrumb điều hướng (Shop > Tên sản phẩm)
  - ✅ Ảnh sản phẩm (full-size)
  - ✅ Thông tin: Tên, Giá, Mô tả, Category
  - ✅ Badge trạng thái kho: **In Stock** / **Only X left** / **Out of Stock**
  - ✅ **Chọn Variant** (biến thể sản phẩm - ví dụ: 128GB, 256GB, 512GB với giá khác nhau)
  - ✅ Chọn **Quantity** (số lượng) với nút +/−
  - ✅ Nút **Add to Cart**

### 1.6 Giỏ Hàng (Cart)
- Click icon giỏ hàng trên Header → Vào trang `/cart`
- **Demo các tính năng:**
  - ✅ Danh sách sản phẩm trong giỏ (ảnh, tên, giá, số lượng)
  - ✅ Tăng/giảm số lượng từng sản phẩm
  - ✅ Xóa sản phẩm khỏi giỏ
  - ✅ **Order Summary**: Tính tổng tiền tự động
  - ✅ Nút **"Proceed to checkout"**

### 1.7 Checkout (Đặt Hàng)
> Quy trình 2 bước: Delivery → Review & Place Order

#### Bước 1: Delivery (Chọn phương thức nhận hàng)
- Chọn **Home delivery** hoặc **Store pickup**
- Nếu chọn Home delivery:
  - ✅ Shipping Address tự động điền từ Profile (trường `deliveryAccess`)
  - ✅ Có thể sửa lại địa chỉ
- Bấm **"Continue to review"**

#### Bước 2: Review & Place Order
- **Demo hiển thị:**
  - ✅ Phương thức nhận hàng đã chọn
  - ✅ Địa chỉ giao hàng
  - ✅ Danh sách sản phẩm + số lượng + giá
  - ✅ Tổng tiền
- Bấm **"Place order"** → Đơn hàng được tạo → Redirect đến trang xác nhận

### 1.8 Quản Lý Tài Khoản (My Account)

#### Profile
- Vào menu người dùng > **Profile**
- **Demo các tính năng:**
  - ✅ Xem/Sửa: Full Name, Phone, Default Delivery Address
  - ✅ Đổi mật khẩu (nhập mật khẩu mới + xác nhận)
  - ✅ Nút **Save changes**

#### My Orders (Lịch sử đơn hàng)
- Vào menu người dùng > **My Orders**
- **Demo các tính năng:**
  - ✅ Danh sách đơn hàng (Order ID, Total, Status, Date)
  - ✅ Badge trạng thái màu sắc: Pending (xám), Confirmed (xanh), Shipping (xanh), Delivered (viền), Cancelled (đỏ)
  - ✅ Click **"View"** để xem chi tiết đơn hàng
  - ✅ **Order Status Timeline** (hiển thị tiến trình đơn hàng)
  - ✅ Chi tiết sản phẩm trong đơn (ảnh, tên, số lượng, giá)
  - ✅ **Hủy đơn hàng**: Nút Cancel (chỉ hiện khi status = Pending)

### 1.9 Trang About
- Click **"About"** trên thanh điều hướng
- Hiển thị thông tin giới thiệu cửa hàng

### 1.10 Đăng Xuất (Logout)
- Click menu người dùng > **Log out**
- Xóa token, redirect về trang Login

---

## PHẦN 2: GIAO DIỆN QUẢN TRỊ (Admin Panel)

> Đăng nhập bằng tài khoản Admin: `admin@co3115.hcmut.edu.vn` / `Admin@123`

### 2.1 Dashboard (Tổng quan)
- Vào `/admin/dashboard` (hoặc click **Dashboard** trên sidebar)
- **Demo các thông số:**
  - ✅ **Total Revenue**: Tổng doanh thu (tính từ đơn hàng không bị cancelled)
  - ✅ **Total Orders**: Tổng số đơn hàng
  - ✅ **Products**: Tổng số sản phẩm
  - ✅ **Customers**: Tổng số khách hàng
  - ✅ **Orders by Status**: Thống kê đơn hàng theo trạng thái (Pending, Confirmed, Shipping, Delivered, Cancelled)
  - ✅ **Recent Orders**: Bảng 5 đơn hàng mới nhất

### 2.2 Quản Lý Sản Phẩm (Products)
- Click **Products** trên sidebar
- **Demo các tính năng:**

#### Danh sách sản phẩm
  - ✅ Bảng sản phẩm: Image, Name, Category, Price, Stock, Actions
  - ✅ **Tìm kiếm** sản phẩm theo tên/category
  - ✅ **Phân trang** (10 sản phẩm/trang)
  - ✅ Badge trạng thái kho: `Out of stock` (đỏ), `Low · X` (vàng), số lượng bình thường (xám)

#### Tạo sản phẩm mới
  - Bấm **"New product"**
  - Điền: Name, Description, Base Price, Stock, Category (dropdown), Image URL
  - Bấm **"Create product"**
  - ✅ Hệ thống tự động tạo 1 Product Item (Variant) mặc định

#### Sửa sản phẩm
  - Bấm icon **bút chì (Edit)** → Dialog sửa thông tin → **"Save changes"**

#### Xóa sản phẩm
  - Bấm icon **thùng rác (Delete)** → Confirm dialog → **"Delete"**

#### Quản lý Variants (Biến thể sản phẩm) ⭐
  - Bấm icon **Layers** (hình các lớp xếp chồng) trên cột Actions
  - **Dialog "Variants for ..." hiện ra:**
    - ✅ Bảng danh sách Variants hiện tại (Price, Status)
    - ✅ Xóa Variant
    - ✅ **Thêm Variant mới**: Điền Price, chọn Status (Available / Out of Stock / Discontinued), Image URL (tùy chọn) → **"Add Variant"**

### 2.3 Quản Lý Danh Mục (Categories)
- Click **Categories** trên sidebar
- **Demo các tính năng:**
  - ✅ Bảng danh mục: Name, Description, Actions
  - ✅ **Tìm kiếm** danh mục
  - ✅ **Phân trang**
  - ✅ **Tạo mới**: Bấm "New category" → Điền Name + Description → "Create category"
  - ✅ **Sửa**: Bấm icon Edit → Sửa thông tin → "Save changes"
  - ✅ **Xóa**: Bấm icon Delete → Confirm → "Delete"

### 2.4 Quản Lý Đơn Hàng (Orders)
- Click **Orders** trên sidebar
- **Demo các tính năng:**
  - ✅ Bảng đơn hàng: Order ID, Customer, Total, Status, Date, Action
  - ✅ **Lọc theo trạng thái**: All / Pending / Confirmed / Shipping / Delivered / Cancelled
  - ✅ **Phân trang**
  - ✅ Bấm **"Manage"** → Dialog chi tiết đơn hàng:
    - Thông tin: Order ID, Customer, Date, Status, Address
    - Danh sách sản phẩm trong đơn (ảnh, tên, số lượng, đơn giá, thành tiền)
    - Tổng tiền
    - **Cập nhật trạng thái đơn hàng** (theo quy trình):
      - `Pending` → `Confirmed` hoặc `Cancelled`
      - `Confirmed` → `Shipping` hoặc `Cancelled`
      - `Shipping` → `Delivered`
      - `Delivered` / `Cancelled` → Trạng thái cuối, không thay đổi được

### 2.5 Quản Lý Khách Hàng (Customers)
- Click **Customers** trên sidebar
- **Demo các tính năng:**
  - ✅ Bảng khách hàng: Email, Role, Active (Toggle Switch), Action
  - ✅ **Tìm kiếm** theo email
  - ✅ **Phân trang**
  - ✅ **Bật/Tắt tài khoản**: Toggle switch để activate/deactivate người dùng
  - ✅ Bấm **"View"** → Dialog chi tiết khách hàng:
    - Avatar + Email + Role
    - Thống kê: Total orders, Total spend
    - Bảng lịch sử đơn hàng của khách hàng đó

---

## PHẦN 3: CÁC TÍNH NĂNG KỸ THUẬT (Nếu cần demo sâu)

### 3.1 Backend (NestJS)
| Tính năng | Mô tả |
|-----------|-------|
| RESTful API | Đầy đủ CRUD cho Product, Category, Order, User |
| JWT Auth | Access Token + Refresh Token |
| Bcrypt | Mã hóa mật khẩu |
| AES Encryption | Mã hóa thông tin nhạy cảm (fullName) |
| MongoDB | Database với MikroORM |
| Swagger | API Documentation tại `/api` |
| Seed Data | Script tạo dữ liệu mẫu (`npm run seed`) |
| Role-based Access | Phân quyền Admin vs Customer |
| Soft Delete | Xóa mềm (đánh dấu `deletedAt`) |

### 3.2 Frontend (React + Vite)
| Tính năng | Mô tả |
|-----------|-------|
| TanStack Router | File-based routing, type-safe |
| TanStack Query | Data fetching, caching, auto-refetch |
| Zustand | State management (auth store) |
| React Hook Form + Zod | Form validation |
| Sonner | Toast notifications |
| Responsive Design | Giao diện thích ứng mobile/desktop |
| Skeleton Loading | Hiệu ứng loading cho mọi trang |
| Pagination | Phân trang cho Products, Orders, Categories, Customers |

### 3.3 Swagger API Documentation
- Mở `http://localhost:3300/api` trên trình duyệt
- Demo danh sách API endpoints theo module:
  - Auth (`/auth/login`, `/auth/register`, `/auth/refresh`)
  - Products (`/products`, `/products/:id`, `/products/:id/items`)
  - Categories (`/categories`)
  - Cart (`/cart`, `/cart/items`)
  - Orders (`/orders`, `/orders/my-orders`)
  - Users (`/users`)

---

## 📌 Gợi Ý Thứ Tự Quay Clip

1. **Khởi động hệ thống** (Backend + Frontend) — 30s
2. **Guest browsing**: Homepage → Shop → Product Detail — 1 phút
3. **Đăng ký tài khoản** mới — 1 phút
4. **Đăng nhập** — 30s
5. **Mua hàng**: Chọn sản phẩm → Add to Cart → Cart → Checkout → Place Order — 2 phút
6. **Xem đơn hàng**: My Orders → View Order Detail — 1 phút
7. **Cập nhật Profile** — 30s
8. **Đăng xuất** → **Đăng nhập Admin** — 30s
9. **Admin Dashboard**: Xem tổng quan — 30s
10. **Admin Products**: Tạo mới + Thêm Variant + Sửa + Xóa — 2 phút
11. **Admin Categories**: CRUD — 1 phút
12. **Admin Orders**: Lọc + Manage + Cập nhật trạng thái — 1 phút
13. **Admin Customers**: Xem + Toggle Active — 30s
14. **(Optional) Swagger API Docs** — 30s

---

## ⚠️ Lưu Ý Trước Khi Quay

1. **Đảm bảo MongoDB đang chạy** (MongoDB Compass hoặc `mongod` service)
2. **Chạy seed data** nếu database trống: `cd back-end && npm run seed`
3. **Clear browser cache** nếu gặp lỗi token cũ
4. **Đăng nhập lại** sau khi sửa dữ liệu trực tiếp trong MongoDB (để frontend lấy data mới)
5. Nếu sản phẩm hiện "Out of Stock" dù còn hàng → Kiểm tra xem sản phẩm đó đã có Variant chưa (vào Admin > Products > icon Layers)
