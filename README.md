# Lab 03 — Chat UI Vue 3 với Mock API

## Thông tin sinh viên

| Hạng mục           | Chi tiết           |
| ------------------ | ------------------ |
| **Họ tên** | Nguyễn Văn Vinh    |
| **Mã sinh viên** | 1771020752         |
| **Lớp** | CNTT17-13          |
| **Link repository**| https://github.com/VINH1811/lab03-chat-ui-vue3.git |
| **Cách chạy Mock API** | `npm run mock-api` |
| **Cách chạy Vue app** | `npm run dev`      |

---

## Kết quả thực hiện

| Hạng mục           | Chi tiết                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Chức năng** | * Hoàn thành tải và hiển thị danh sách tin nhắn cũ tự động từ Mock API khi ứng dụng khởi chạy (`onMounted`).<br>* Hoàn thành chức năng gửi tin nhắn của User kết hợp lưu trữ xuống cơ sở dữ liệu giả lập (`POST /messages`).<br>* Tích hợp cơ chế phản hồi tự động ngẫu nhiên của Bot (`botReplies`) kèm hiệu ứng "Bot đang gõ..." và độ trễ 1.5s sinh động.<br>* Xây dựng thành công tính năng "Dọn dẹp chat" thông qua vòng lặp xử lý bất đồng bộ `Promise.all` giúp xóa triệt để dữ liệu cục bộ bằng phương thức `DELETE`.<br>* Cài đặt thành công hiệu ứng chuyển cảnh mượt mà bằng `<TransitionGroup>` khi xuất hiện tin nhắn mới.<br>* Triển khai bộ theo dõi `watch` kiểm tra độ dài văn bản thời gian thực và đưa ra cảnh báo trực quan khi nhập vượt quá 200 ký tự. |
| **AI hỗ trợ** | * Cung cấp cấu trúc khung ban đầu (Scaffold) cho các tầng thư mục của ứng dụng Vue 3.<br>* Gợi ý cấu trúc viết Axios service độc lập và bộ khung Pinia Store quản lý trạng thái.<br>* Hướng dẫn xây dựng các component con bằng Composition API (`MessageBubble.vue`, `MessageInput.vue`) đúng chuẩn kỹ thuật props/emit.<br>* Hỗ trợ định hướng tư duy phân tích lỗi khi cấu hình sai cổng kết nối mạng (port). |
| **Sinh viên tự làm**| * Tự tay tinh chỉnh giao diện, viết CSS Scoped trực quan giúp phân biệt rõ ràng bố cục tin nhắn của User (màu xanh, đẩy phải) và Bot (màu xám, đẩy trái).<br>* Chủ động cá nhân hóa phong cách viết code bằng cách đổi tên hàm nghiệp vụ từ `createMessage` thành `addMessage` tại lớp Service.<br>* Nâng cấp giao diện bằng cách tích hợp thêm bộ đếm ký tự thực tế `textInput.length / MAX_LENGTH` bên trong component `MessageInput.vue`.<br>* Thiết kế và phát triển thêm component bổ sung `BaseModal.vue` nhằm tạo hộp thoại cảnh báo lịch sự trước khi cho phép người dùng xóa lịch sử chat.<br>* Tự giải quyết cảnh báo nghiêm ngặt từ Linter (`eslint(no-unused-vars)`) ở khối lệnh `catch` trong file `chatStore.js` để đảm bảo code sạch tuyệt đối trước khi nộp bài.<br>* Tự vẽ và phân tích luồng dữ liệu một chiều di chuyển qua 5 bước nghiêm ngặt. |
| **Kiểm tra Mock API**| * Hệ thống Mock API vận hành ổn định tại địa chỉ cổng `http://localhost:3001`.<br>* Kết quả khi truy cập endpoint `GET /messages` trả về cấu trúc mảng đối tượng có đầy đủ các trường dữ liệu định danh: `id`, `sender`, `content`, `createdAt`, và `type`.<br>* Kết quả khi truy cập endpoint `GET /botReplies` trả về danh sách 4 câu trả lời mẫu học tập soạn sẵn của hệ thống.<br>*(Sinh viên dán ảnh hoặc mô tả kết quả cụ thể tại đây)* |
| **Kiểm tra hiểu code**| Thử thách câu hỏi từ giảng viên: **"Trong `ChatWindow.vue`, nếu bỏ dòng gọi `chatStore.fetchMessages()` trong hook `onMounted` thì điều gì sẽ xảy ra?"**<br><br>**Trả lời ngắn:** Nếu loại bỏ dòng lệnh này, ứng dụng sẽ hoàn toàn **không thể tải lại toàn bộ lịch sử trò chuyện cũ** được lưu trữ trong file `db.json` của Mock API lên màn hình mỗi khi người dùng tải lại trang (F5/Reload) hoặc khi vừa mở ứng dụng lên. Mặc dù backend Mock API vẫn lưu giữ dữ liệu, nhưng do thiếu lệnh kích hoạt nạp dữ liệu ở client lúc khởi tạo, mảng `messages` trong Pinia store sẽ bị rỗng, dẫn đến giao diện hiển thị trạng thái "Hội thoại trống", làm đứt gãy trải nghiệm liền mạch của người dùng. |
| **Ảnh minh chứng** | ![Giao diện Chat UI](lab3/images/giaodien.png) |

---

## Luồng di chuyển dữ liệu của ứng dụng (Data Flow)

Để minh chứng cho việc hiểu sâu sắc kiến trúc hệ thống của bài Lab, dưới đây là sơ đồ di chuyển dữ liệu một chiều tuần tự:

```txt
MessageInput (Con) ──(phát emit 'send-message')──> ChatWindow (Cha)
                                                        │
                                                        ▼
                                              Gọi Action trong Pinia Store
                                                        │
                                                        ▼
                                              Gọi hàm kết nối ở chatApi.js
                                                        │
                                                        ▼
Giao diện render tự động <── [Cập nhật State] <── [Mạng HTTP POST /messages] ──> Mock API (db.json)