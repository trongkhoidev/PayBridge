# Design System Specification (Human-Centric Fintech) — PayBridge

> **Human-Centric Fintech Theme**: Được tối ưu hóa cho trải nghiệm người dùng thực tế, ấm áp, thân thiện, dễ đọc nhưng vẫn giữ trọn vẹn tính chính xác, bảo mật và uy tín của nền tảng tài chính doanh nghiệp.

---

## 1. Triết lý Thiết kế (Human-Centric & Approachable Philosophy)

- **Thân thiện & Gần gũi (Warm Human Approach)**: Tránh cảm giác lạnh lẽo, máy móc, cyberpunk hay terminal công nghiệp. Sử dụng tone nền ấm (`#F8F9FA`), thẻ trắng viền bo góc mềm mại (`rounded-2xl`), lời chào đón con người trực quan ("Xin chào, Acme Global! 👋"), và lời giải thích ngắn gọn, dễ hiểu.
- **Minh bạch & Tôn trọng Người dùng (Transparent & Reassuring)**: Mọi thao tác tài chính đều có thông báo rõ ràng: Môi trường thử nghiệm Sandbox (không mất tiền thật), quy trình kiểm soát kép bảo vệ ngân sách, và người thụ hưởng nhận được bao nhiêu tiền (không làm tròn sai số).
- **Tránh Jargon Khó hiểu**: Kết hợp tiếng Việt tự nhiên làm ngôn ngữ hiển thị chính, phụ đề thuật ngữ tài chính quốc tế (CFO, Dual-Control, NAPAS 24/7, 9Pay Gateway) để cả kế toán nội địa lẫn ban giám đốc nước ngoài đều nắm bắt ngay lập tức.
- **Trí tuệ Nhân tạo An toàn & Đồng hành**: Gemini AI đóng vai trò như một cộng sự cố vấn mẫn cán, giải thích luật thuế TNCN 10% và cảnh báo khoản chi lớn, nhưng không bao giờ tự ý thao tác tiền bạc của con người.

---

## 2. Bảng Màu & Cảm xúc (Palette & Mood)

| Nhóm Màu | Giá trị Màu / Class | Cảm xúc & Ý nghĩa Ứng dụng |
|---|---|---|
| **Nền Canvas Ấm** | `#F8F9FA` | Nền sáng dịu mắt, ấm áp, không gây mỏi mắt khi làm việc lâu |
| **Bề mặt Thẻ (Card Surface)** | `bg-white border border-slate-200/90 shadow-soft rounded-2xl` | Thẻ bo tròn 16px mềm mại, tạo chiều sâu tự nhiên |
| **Thanh Điều hướng (Sidebar)** | `#181C26` (Warm Deep Charcoal Navy) | Vững chãi, tin cậy, không quá đen gắt, làm nổi bật logo và menu |
| **Màu Nhận diện Chủ đạo** | `bg-indigo-600 hover:bg-indigo-700` (`#4F46E5`) | Sắc chàm hiện đại, năng động, chuẩn mực Fintech quốc tế (Wise, Stripe) |
| **Trạng thái Hoàn thành / Duyệt** | `bg-emerald-50 text-emerald-800 border-emerald-200` | Xanh ngọc an tâm, báo hiệu tiền đã giải ngân an toàn |
| **Trạng thái Thử nghiệm / Lưu ý** | `bg-amber-50 text-amber-800 border-amber-200` | Vàng mật ong ấm áp, nhắc nhở môi trường Sandbox an toàn |
| **Trạng thái Đang xử lý / Kiểm tra** | `bg-sky-50 text-sky-800 border-sky-200` | Xanh da trời thân thiện, báo hiệu hệ thống đang đối soát |
| **Trạng thái Cảnh báo / Lỗi** | `bg-rose-50 text-rose-800 border-rose-200` | Đỏ san hô nhẹ nhàng, chỉ rõ điểm cần người dùng chỉnh sửa |

---

## 3. Kiểu chữ & Số học Chính xác (Typography Hierarchy)

- **Phông chữ Chính (Humanist Sans-Serif)**: **`Plus Jakarta Sans`** (Google Fonts hỗ trợ đầy đủ tiếng Việt). Các nét chữ bo tròn tự nhiên, khoảng cách chữ thoáng, dễ đọc và tạo cảm giác thân thiện, đáng tin cậy.
- **Hiển thị Số tiền (Lossless Tabular Numerals)**: Enforce `tabular-nums font-bold` kết hợp phân cách hàng ngàn dấu phẩy (`15,000,000 VND`), giúp mắt quét nhanh các khoản tiền theo cột dọc mà không bị nhảy ký tự.
- **Phông chữ Kỹ thuật Phụ (Monospace)**: **`JetBrains Mono`** chỉ sử dụng cho các mã hệ thống cần copy-paste chính xác như Batch ID, Idempotency Key, và số tài khoản ngân hàng.

---

## 4. Các Thành phần Tương tác Phía Người dùng

1. **Thanh Chào & Trạng thái (Welcome & Status Banner)**:
   - Hiển thị lời chào thân mật kèm biểu tượng vẫy tay `👋`.
   - Huy hiệu `Cổng 9Pay Testnet (Mô phỏng an toàn)` giúp người dùng yên tâm thử nghiệm toàn bộ luồng mà không lo bị trừ tiền tài khoản.
2. **Quy trình Duyệt chi 4 Bước (Visual Lifecycle Stepper)**:
   - Bước 1: *Bản nháp* (Nhập danh sách & số tiền).
   - Bước 2: *Đã kiểm tra* (Đối soát tài khoản ngân hàng NAPAS).
   - Bước 3: *CFO đã ký duyệt* (Kiểm soát kép theo chuẩn SEC-804).
   - Bước 4: *Đã chuyển tiền* (9Pay và NAPAS 24/7 ghi nhận mã giao dịch).
3. **Modal Ký duyệt Kiểm soát kép (`DualControlSignoffModal.tsx`)**:
   - Thiết kế thẻ trắng mềm mại, thông báo rõ cam kết pháp lý và danh sách tiền thụ hưởng trước khi bấm xác nhận.
4. **Modal Hoạt hoạ Giải ngân 4 Chặng (`SettlementDispatchModal.tsx`)**:
   - Từng bước kiểm tra chữ ký, bắt tay cổng 9Pay, điều phối chuyển mạch NAPAS và trả biên lai giao dịch thành công.
5. **Khay Cố vấn Rủi ro Gemini AI (`GeminiAdvisorDrawer.tsx`)**:
   - Hỗ trợ giải thích thuế TNCN 10%, kiểm tra tương thích ngân hàng và tạo biên bản tóm tắt cho ban lãnh đạo.
