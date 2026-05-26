# AI_PROMPTS.md — Lab 03 Chat UI Vue 3 với Mock API

## Prompt 1

| Hạng mục                | Nội dung |
| ----------------------- | -------- |
| **Mục tiêu** | Khởi tạo project Vue 3 bằng Vite, cài đặt Pinia, Axios, json-server và thiết lập cấu trúc thư mục tiêu chuẩn. |
| **Prompt đã dùng** | "Bạn là pair programmer cho học phần FIT4104. Hãy hướng dẫn tôi khởi tạo project Vue 3 bằng Vite cho bài lab giao diện chat dùng Mock API. Yêu cầu: Dùng Composition API, cài Pinia, Axios, json-server. Tạo scaffold ban đầu và giải thích cấu trúc." |
| **AI trả lời tóm tắt** | Hướng dẫn chạy lệnh tạo project bằng Vite, cài đặt các package phụ thuộc, hướng dẫn thêm script `"mock-api"` vào `package.json` và đặt câu hỏi kiểm tra độ hiểu scaffold. |
| **Code đã lấy từ AI** | Cấu trúc lệnh cài đặt, đoạn mã bổ sung trường `scripts` trong file `package.json`. |
| **Tôi đã sửa gì** | Bổ sung và đồng bộ các công cụ kiểm tra lỗi code và format có sẵn trong đồ án gốc (`oxlint`, `eslint`, `prettier`) vào chung với script chạy `json-server`. |
| **Tôi hiểu gì sau khi sửa** | Hiểu được cách cấu hình lệnh chạy song song: `npm run dev` để phục vụ hiển thị giao diện và `npm run mock-api` ở port 3001 để giả lập cơ sở dữ liệu backend. |

## Prompt Mock API

| Hạng mục                   | Nội dung |
| -------------------------- | -------- |
| **Mục tiêu** | Thiết lập tệp dữ liệu Mock API `db.json` chứa các tài nguyên phục vụ việc phản hồi và lưu trữ lịch sử chat. |
| **Prompt đã dùng** | "Trong project Vue 3 FIT4104, hãy giúp tôi tạo file mock-api/db.json cho app chat. Yêu cầu có resource messages và botReplies kèm dữ liệu mẫu phù hợp bài học." |
| **Endpoint đã tạo** | `GET /messages`, `POST /messages`, `DELETE /messages/:id`, `GET /botReplies`. |
| **Cách tôi kiểm tra endpoint** | Khởi chạy lệnh `npm run mock-api` rồi trực tiếp truy cập vào các đường dẫn `http://localhost:3001/messages` và `http://localhost:3001/botReplies` bằng trình duyệt web để kiểm tra cấu trúc JSON trả về. |
| **Tôi hiểu gì về Mock API**| `json-server` hoạt động dựa trên cơ chế RESTful tự động. Khi ta gửi request `POST`, nó tự ghi dữ liệu mới xuống file vật lý; khi gọi `DELETE` kèm ID, nó tự tìm và xóa bỏ đối tượng tương ứng khỏi mảng dữ liệu. |

## Prompt debug

| Hạng mục          | Nội dung |
| ----------------- | -------- |
| **Lỗi gặp phải** | Trình kiểm tra lỗi nghiêm ngặt Linter (ESLint/Oxlint) báo lỗi gợn sóng đỏ tại file `chatStore.js` với nội dung: `Catch parameter 'err' is caught but never used. (eslint(no-unused-vars))`. |
| **Prompt hỏi AI** | *"lỗi gì đây ở file chatStore.js"* (kèm theo ảnh chụp màn hình hiển thị thông báo lỗi của VS Code). |
| **Gợi ý AI đưa ra** | AI giải thích đây không phải lỗi sập ứng dụng mà là cảnh báo viết code sạch (clean code). AI đề xuất 2 giải pháp: Hoặc lược bỏ biến `err` ở mệnh đề `catch`, hoặc đưa biến `err` vào hàm `console.error` để sử dụng. |
| **Cách tôi kiểm tra** | Xem lại khối lệnh `try/catch` của hàm `sendBotReply` tại dòng số 83 trong file `chatStore.js`. |
| **Cách tôi sửa** | Áp dụng giải pháp sử dụng JavaScript hiện đại: loại bỏ hoàn toàn biến thừa `err` và giữ lại mệnh đề `catch` trống dạng `catch { ... }` giúp loại bỏ hoàn toàn gợn sóng cảnh báo của Linter. |
| **Bài học rút ra** | Quy trình kiểm tra mã nguồn tự động (Linter) giúp phát hiện các biến được khởi tạo nhưng không sử dụng, từ đó giúp tối ưu hóa bộ nhớ và giữ cho mã nguồn luôn sạch sẽ, dễ đọc. |

## Kiểm tra hiểu code

| Hạng mục                 | Nội dung |
| ------------------------ | -------- |
| **Dòng code được chọn** | Lệnh gọi `await chatStore.fetchMessages()` đặt bên trong hook `onMounted()` của component `ChatWindow.vue`. |
| **Nếu bỏ dòng này thì sao?** | Ứng dụng sẽ bị mất tính năng đồng bộ và tải lại lịch sử trò chuyện cũ. |
| **Tôi giải thích được gì** | Khi người dùng bấm F5 (Reload) hoặc tắt đi mở lại ứng dụng, toàn bộ màn hình chat sẽ hiển thị trạng thái trống rỗng ("Hội thoại trống") mặc dù bên trong tệp tin `db.json` của Mock API vẫn lưu trữ đầy đủ dữ liệu tin nhắn cũ. |
| **Phần tôi chưa chắc** | Bản chất bất đồng bộ của việc nạp dữ liệu có thể làm giao diện bị giật nhẹ nếu mạng chậm, cần xử lý thêm trạng thái Loading để tối ưu hơn. |