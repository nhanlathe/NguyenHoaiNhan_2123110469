# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ (BRD)
**Tên dự án:** HỆ THỐNG QUẢN LÝ NHÀ SÁCH THÔNG MINH & LOYALTY (BMS - BOOKSTORE MANAGEMENT SYSTEM)

---

## 1. MỤC TIÊU VÀ PHẠM VI DỰ ÁN

### 1.1 Mục tiêu
*   Xây dựng một hệ thống phần mềm quản lý nhà sách tích hợp mô hình trực tuyến (Storefront) và bán hàng tại quầy (POS).
*   Quản lý hàng hóa, tồn kho, kho sách điện tử và vật lý một cách đồng bộ.
*   Phát triển và duy trì hệ thống khách hàng thân thiết (Loyalty Program) mạnh mẽ: Quản lý điểm phúc lợi, tước hiệu (Tier), và các chương trình ưu đãi (Voucher/Coupon) nhằm kích thích nhu cầu mua sắm.
*   Cải thiện chất lượng dịch vụ chăm sóc khách hàng thông qua kênh Hỗ trợ trực tuyến (Support Inbox) đa chiều.

### 1.2 Phạm vi
*   **Phạm vi hệ thống:** Web Application.
*   **Người dùng mục tiêu:** Ban Quản Trị (Admin), Nhân viên nhà sách (Staff), Khách hàng cá nhân (Member).
*   **Tích hợp:** Tích hợp thành công cổng thanh toán điện tử (VNPay).

---

## 2. PHÂN TÍCH CÁC BÊN LIÊN QUAN (STAKEHOLDERS)

| STT | Bên liên quan | Vai trò & Quyền hạn |
| :--- | :--- | :--- |
| 1 | **Admin (Quản trị viên)** | Có quyền hạn cao nhất trong hệ thống. Quản trị hệ thống nhân sự, cấu hình các chương trình ưu đãi/Vouchers, quản lý danh mục và thông tin sản phẩm chuyên sâu. |
| 2 | **Staff (Nhân viên)** | Sử dụng hệ thống để thực hiện bán hàng tại quầy (POS), kiểm soát đơn hàng online, quản lý khách hàng thân thiết, phản hồi hỗ trợ khách hàng và xem báo cáo doanh thu cơ bản. |
| 3 | **Member (Khách hàng)** | Đối tượng sử dụng giao diện Storefront. Có thể tìm kiếm sách, thêm vào giỏ hàng, đặt hàng, quản lý điểm Loyalty, đổi thưởng và sử dụng hệ thống Support để giải đáp thắc mắc. |

---

## 3. QUY TRÌNH NGHIỆP VỤ CHI TIẾT (BUSINESS PROCESS)

### 3.1 Quy trình Bán Hàng & Tích Điểm (POS/Online)
1.  **Online:** Khách hàng đăng nhập, thêm hàng vào giỏ, áp dụng Voucher, chọn phương thức thanh toán (COD hoặc VNPay) và hoàn tất. Hệ thống tự động trừ tồn kho và ghi nhận điểm phúc lợi sau khi đơn được giao thành công.
2.  **POS (Tại quầy):** Nhân viên quét sản phẩm hoặc chọn trên máy. Hỏi SĐT khách hàng để kiểm tra hạng thẻ Loyalty. Hệ thống tự động áp dụng chính sách giảm giá của hạng thẻ. Khách thanh toán tiền mặt/chuyển khoản, hệ thống ghi nhận doanh thu và cộng điểm/stamps cho khách hàng.

### 3.2 Quy trình Quản lý Khách Hàng Thân Thiết (Loyalty)
1.  Khi khách mua hàng, số tiền chi tiêu được quy đổi thành **Điểm Phúc Lợi (PointBalance)**.
2.  Tổng số tiền chi tiêu (TotalSpent) đạt các mốc nhất định sẽ tự động nâng/hạ **Hạng Thẻ (Tier)**: Khách Thường (Member) -> Bạc (Silver) -> Vàng (Gold) -> Kim Cương (Diamond).
3.  Admin/Staff có thể phát hành Voucher riêng cho một nhóm khách hàng hoặc khách hàng đổi điểm tích luỹ để lấy quà tặng/Voucher trong hồ sơ cá nhân.

### 3.3 Quy trình Hỗ Trợ Khách Hàng (Support Inbox)
1.  Khách hàng tạo mới 1 yêu cầu (Ticket) qua tính năng Support ở Frontend.
2.  Ticket được đưa vào hộp thư hỗ trợ chung của Admin/Staff.
3.  Staff trả lời tin nhắn. Khi có tin nhắn mới, chuông thông báo (Unread Count) ở cả 2 phía được kích hoạt.
4.  Quy trình kết thúc khi vấn đề được giải quyết.

---

## 4. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 4.1 Module Tài Khoản & Phân Quyền (Auth)
*   **FR-AUTH-01:** Đăng nhập, đăng ký tài khoản (Dành cho Customer).
*   **FR-AUTH-02:** Quản lý nhân sự: Cấp/Xoá tài khoản Staff/Admin (Dành cho Admin).
*   **FR-AUTH-03:** Cập nhật thông tin Profile (Họ tên, SĐT cá nhân).

### 4.2 Module Sản Phẩm & Tồn Kho (Catalog & Inventory)
*   **FR-PROD-01:** Quản lý sản phẩm (CRUD): SKU, Tên, Giá, Đơn vị tính, Phân loại, Ảnh.
*   **FR-PROD-02:** Quản lý Tồn kho, theo dõi số lượng, Batch Date, Expiry Date.
*   **FR-PROD-03:** Quản lý thuộc tính động của sách (Author, ISBN) thông qua JSON.
*   **FR-PROD-04:** Quản lý Combo/Virtual Products.

### 4.3 Module Bán Hàng (Order & Checkout)
*   **FR-ORD-01:** Quản lý giỏ hàng online.
*   **FR-ORD-02:** Checkout với tích hợp VNPay và Cash on Delivery.
*   **FR-ORD-03:** Bán hàng tại quầy (POS) nhanh chóng, in hoá đơn.
*   **FR-ORD-04:** Duyệt và quản lý trạng thái đơn hàng (Pending, Processing, Delivered, Cancelled).

### 4.4 Module Loyalty & Vouchers (Customer Retention)
*   **FR-LOY-01:** Quản lý danh sách thành viên Loyalty, xem điểm, thay đổi thủ công hạng thẻ hoặc điểm.
*   **FR-LOY-02:** Hệ thống tự động nâng cấp hạng (Tier) theo TotalSpent.
*   **FR-LOY-03:** Quản lý tạo mã giảm giá (Coupon/Voucher), giới hạn số lượt sử dụng, thời hạn.
*   **FR-LOY-04:** Issue (phát hành) Voucher trực tiếp vào ví của user.

### 4.5 Module Hỗ Trợ (Support)
*   **FR-SUP-01:** Khách hàng gửi yêu cầu hỗ trợ mới.
*   **FR-SUP-02:** Real-time thread chat giữa Customer và Staff.
*   **FR-SUP-03:** Cảnh báo tin nhắn chưa đọc (Unread badge).

---

## 5. MÔ HÌNH DỮ LIỆU DỰ KIẾN (DATA MODEL)

Hệ thống sử dụng cơ sở dữ liệu quan hệ (RDBMS) với các bảng dữ liệu sau:

### 5.1 Các bảng Hệ thống & Tài khoản
*   **AppUser**: Chứa thông tin đăng nhập. `Id, Username, Password, Role, FullName, PhoneNumber, CreatedAt`.

### 5.2 Các bảng Sản phẩm (Catalog)
*   **Product**: `Id, Sku, Name, UoM, BasePrice, Department, Category, ImageUrl, IsVirtual`.
*   **ProductMetadata**: `Id, ProductId, AttributesJson` (Lưu ISBN, Author,...).
*   **Inventory**: `Id, ProductId, Quantity, BatchDate, ExpiryDate`.
*   **VirtualSkuLink**: Dành cho combo. `Id, ComboId, ComponentId, QuantityRequired`.

### 5.3 Các bảng Bán hàng (Order)
*   **Order**: `Id, OrderNumber, CustomerId, TotalAmount, Status, PaymentMethod, PaymentStatus, VnPayTransactionId, CreatedAt`.
*   **OrderItem**: `Id, OrderId, ProductId, ProductName, Quantity, Price`.
*   **Wishlist**: `Id, CustomerId, ProductId, AddedAt`.
*   **Review**: `Id, ProductId, CustomerId, Rating, Comment, CreatedAt`.

### 5.4 Các bảng Loyalty & Khách hàng
*   **Customer**: Hồ sơ định danh khách mua. `Id, UserId, PhoneEncrypted, EmailEncrypted, Persona, PersonaDetailJson, PhoneNumber, CreatedAt`.
*   **LoyaltyProfile**: Hồ sơ thẻ thành viên. `Id, CustomerId, Tier, TotalSpent, PointBalance, EStamps`.
*   **LoyaltyTransaction**: Lịch sử cộng/trừ điểm. `Id, CustomerId, PointsEarned, StampsEarned, Reason, CreatedAt`.

### 5.5 Các bảng Ưu đãi (Voucher/Coupon)
*   **Coupon**: Thông tin mã giảm. `Code, Title, Description, DiscountValue, IsPercentage, ExpiryDate, UsageLimit, UsageCount`.
*   **CustomerCoupon**: Ví Voucher của khách. `Id, CustomerId, CouponCode, IsUsed, ReceivedAt`.

### 5.6 Các bảng Hỗ trợ (Support)
*   **SupportRequest**: Ticket hỗ trợ. `Id, CustomerId, Subject, Status, IsReadByAdmin, IsReadByCustomer, CreatedAt, LastUpdatedAt`.
*   **SupportMessage**: Chi tiết tin nhắn. `Id, SupportRequestId, SenderType, Content, CreatedAt`.
