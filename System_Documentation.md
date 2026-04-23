# Tài Liệu Chức Năng - Loyalty Management System

Dưới đây là tài liệu chi tiết mô tả chức năng của trang web Antiquity Bookstore (Loyalty Management System), được phân chia theo từng vai trò (Admin, Staff, Member). Tài liệu cũng liệt kê rõ ràng các API tương ứng được sử dụng cho mỗi chức năng.

---

## 1. Xác Thực (Authentication)
*Áp dụng chung cho cả 3 vai trò: Admin, Staff, Member.*

*   **Đăng nhập hệ thống**: Đăng nhập vào trang web để nhận session tương ứng.
    *   `POST /api/Auth/login`
*   **Đăng ký tài khoản mới**: Khách hàng tự tạo tài khoản mới.
    *   `POST /api/Auth/register`
*   **Cập nhật thông tin tài khoản**: Sửa đổi họ tên, số điện thoại.
    *   `PUT /api/Auth/profile`

---

## 2. Vai Trò: Member (Khách Hàng - `hieukarlam/123`)

Đây là giao diện Storefront dành cho người mua hàng.

*   **Trang chủ Cửa hàng (`/home`)**: Hiển thị danh sách sách và vật phẩm để khách hàng lựa chọn mua sắm.
    *   `GET /api/Products`: Lấy danh sách tất cả sản phẩm.
*   **Hồ Sơ Thành Viên (`/profile`)**: Nơi xem hạng thẻ Loyalty (Member, Silver, Gold, Diamond), xem số điểm phúc lợi hiện có và thực hiện thao tác **Đổi quà tặng** từ điểm.
    *   `GET /api/Customers/my-profile/{userId}`: Truy xuất thông tin hạng thẻ và điểm phúc lợi.
    *   `POST /api/Loyalty/redeem-points`: Xử lý logic trừ điểm để đổi quà.
    *   `GET /api/Support/customer/{customerId}/unread-count`: (Tiện ích) Đếm số lượng tin nhắn từ bộ phận hỗ trợ chưa đọc để hiển thị thông báo.
*   **Giỏ Hàng & Thanh Toán (`/cart`)**: Cho phép khách hàng áp dụng mã giảm giá và thanh toán đơn hàng (Tích hợp cổng thanh toán VNPay).
    *   `POST /api/Orders/checkout`: Khởi tạo đơn hàng online và trả về link thanh toán VNPay.
*   **Hòm Thư Hỗ Trợ (`/support`)**: Gửi câu hỏi, khiếu nại hoặc trao đổi trực tiếp với nhân viên quản thư (chat thread).
    *   `GET /api/Support/customer/{customerId}`: Xem danh sách các ticket hỗ trợ của chính mình.
    *   `POST /api/Support`: Tạo một yêu cầu (ticket) hỗ trợ mới.
    *   `GET /api/Support/{id}`: Xem lịch sử tin nhắn trong một ticket.
    *   `POST /api/Support/{id}/message`: Gửi tin nhắn mới vào đoạn hội thoại.
    *   `PUT /api/Support/{id}/mark-read-customer`: Đánh dấu là khách hàng đã xem tin nhắn mới nhất của admin/staff.
*   **Lịch Sử Đơn Hàng (`/order-history`)**: Xem lại các đơn hàng đã đặt trong quá khứ và trạng thái của chúng.
    *   `GET /api/Orders/my-orders/{customerId}`: Lấy danh sách lịch sử mua hàng cá nhân.
*   **Ưu Đãi Của Tôi (`/my-vouchers`)**: Xem các voucher, mã giảm giá (coupon) mà khách hàng đang sở hữu.
    *   `GET /api/Vouchers/my-vouchers/{userId}`: Lấy các mã voucher áp dụng được cho khách hàng này.
*   **Cài Đặt Tài Khoản (`/account-settings`)**: Sửa đổi thông tin cơ bản.
    *   `PUT /api/Auth/profile`: Cập nhật lại thông tin cá nhân.

---

## 3. Vai Trò: Staff (Nhân Viên Thu Ngân/Quản Thư - `staff/123`)

Nhân viên chủ yếu sử dụng phần Dashboard để vận hành, bán hàng và chăm sóc khách.

*   **Bảng Điều Khiển/Thống Kê (`/dashboard`)**: Xem tổng quan về tổng doanh thu, số lượng đơn hàng, số thẻ thành viên mới đăng ký.
    *   `GET /api/Loyalty/dashboard`: Cung cấp các số liệu thống kê chung.
*   **Bán Hàng & Tích Điểm - POS (`/dashboard/pos`)**: Giao diện máy tính tiền. Nhân viên có thể thêm sản phẩm vào đơn, nhập số điện thoại khách để tích điểm trực tiếp tại quầy.
    *   `GET /api/Products`: Load danh sách sản phẩm để chọn bán.
    *   `GET /api/Customers/my-profile/{userId}` *(thông qua tìm kiếm)*: Tìm thông tin hạng thẻ khách hàng để giảm giá hoặc tích điểm.
    *   `POST /api/Orders/create-order`: Tạo đơn hàng trực tiếp (offline/POS).
*   **Lịch Sử Bán Hàng (`/dashboard/sales-history`)**: Quản lý toàn bộ đơn hàng trong hệ thống (cả online và offline). Duyệt đơn hàng hoặc thay đổi trạng thái thanh toán.
    *   `GET /api/Orders`: Lấy danh sách toàn bộ đơn.
    *   `PUT /api/Orders/{id}/approve`: Duyệt và thay đổi trạng thái đơn hàng.
*   **Thành Viên Thân Thiết (`/dashboard/customers`)**: Quản lý dữ liệu tệp khách hàng Loyalty.
    *   `GET /api/Customers`: Lấy danh sách toàn bộ thẻ thành viên.
    *   `PUT /api/Customers/{id}/tier`: Nâng hoặc hạ hạng thẻ của khách.
    *   `PUT /api/Customers/{id}/points`: Chỉnh sửa (cộng/trừ) số điểm phúc lợi của khách hàng một cách thủ công.
*   **Hòm Thư Hỗ Trợ (`/dashboard/support`)**: Theo dõi và giải đáp thắc mắc của tất cả thành viên.
    *   `GET /api/Support`: Lấy danh sách tất cả các ticket hỗ trợ từ khách gửi về.
    *   `GET /api/Support/{id}`: Xem chi tiết đoạn chat của một ticket.
    *   `POST /api/Support/{id}/message`: Phản hồi lại khách.
    *   `PUT /api/Support/{id}/mark-read-admin`: Đánh dấu là nhân viên đã đọc tin nhắn của khách.
    *   `GET /api/Support/unread-count-admin`: Đếm tổng số tin nhắn chưa đọc từ mọi khách hàng để hiển thị chuông thông báo.
*   **Tủ Sách/Sản Phẩm (`/dashboard/products`)**: Quản lý kho sách. Nhân viên có thể xem thông tin sản phẩm (có thể không có quyền xoá tuỳ phân quyền).
    *   `GET /api/Products`: Load danh sách.

---

## 4. Vai Trò: Admin (Quản Trị Viên - `admin/123`)

Admin có **toàn bộ quyền hạn của Staff**, cộng thêm các quyền quản lý nhân sự, voucher và tạo/sửa thông tin sản phẩm chuyên sâu.

*   **Quản Lý Nhân Viên (`/dashboard/staff`)**: Phân quyền, thêm tài khoản cho nhân sự mới hoặc sa thải nhân sự.
    *   `GET /api/Admin/users`: Lấy danh sách toàn bộ tài khoản (bao gồm role Admin/Staff).
    *   `PUT /api/Admin/users/{id}`: Sửa đổi thông tin, phân lại role (phân quyền).
    *   `DELETE /api/Admin/users/{id}`: Xoá tài khoản khỏi hệ thống.
*   **Quản Lý Ưu Đãi / Voucher (`/dashboard/vouchers`)**: Tạo ra các chiến dịch tặng mã giảm giá mới và rải (issue) mã đó cho khách hàng.
    *   `GET /api/Vouchers`: Danh sách voucher trên hệ thống.
    *   `POST /api/Vouchers`: Khởi tạo một Voucher mới.
    *   `POST /api/Vouchers/issue`: Phát hành (tặng) voucher thẳng vào kho "Ưu đãi của tôi" cho tất cả hoặc một số khách hàng cụ thể.
*   **Quản Trị Tủ Sách/Sản Phẩm (`/dashboard/products`)**: Quản trị viên mới có quyền thêm sách mới, cập nhật giá hoặc gỡ bỏ sản phẩm.
    *   `POST /api/Products`: Tạo sản phẩm/sách mới.
    *   `PUT /api/Products/{id}`: Cập nhật thông tin (giá, kho,...).
    *   `DELETE /api/Products/{id}`: Xoá sản phẩm.
*   **Báo Cáo Nâng Cao (Backend Services - Có thể được tích hợp)**: Các số liệu chuyên sâu về sức khỏe kinh doanh.
    *   `GET /api/Admin/reports/dead-stock`: Lấy báo cáo hàng tồn lâu ngày.
    *   `GET /api/Admin/reports/loyalty-efficiency`: Lấy báo cáo đánh giá sự hiệu quả của chương trình thẻ thành viên.
    *   `POST /api/Upload`: API hỗ trợ tải ảnh/file lên hệ thống phục vụ tạo sản phẩm.
