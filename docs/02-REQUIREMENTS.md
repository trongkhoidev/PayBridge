# PayBridge — Functional & Non-Functional Requirements

## 1. Mục tiêu

Giúp doanh nghiệp chuẩn bị, phê duyệt và theo dõi một đợt chi trả cho nhân viên/freelancer thông qua provider được tích hợp. MVP tập trung vào một luồng payout testnet/sandbox có thể demo từ đầu đến cuối.

## 2. Người dùng và vai trò

- **Employer Admin:** tạo và sửa batch ở trạng thái nháp; xem lịch sử.
- **Approver:** kiểm tra và phê duyệt batch.
- **Viewer:** chỉ xem batch và trạng thái.
- **System/Provider:** cập nhật kết quả giao dịch qua API response, webhook hoặc status polling.

MVP có thể dùng một tài khoản demo, nhưng backend vẫn phải enforce quyền ở các endpoint nhạy cảm.

## 3. Functional Requirements (FR)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-01 | Tạo payout batch | P0 | Employer Admin tạo batch có ít nhất 1 payout item; API trả batch ID. |
| FR-02 | Nhập người nhận | P0 | Mỗi item có recipient reference, amount và asset/currency; dữ liệu bắt buộc được validate. |
| FR-03 | Validate batch | P0 | Hệ thống từ chối amount <= 0, dữ liệu thiếu, item trùng theo quy tắc đã định và batch vượt giới hạn demo. |
| FR-04 | Tính tổng | P0 | Tổng batch khớp tổng các item; dùng decimal-safe arithmetic, không dùng JS floating-point để tính tiền. |
| FR-05 | Quote/fee | P1 | Nếu provider hỗ trợ, hiển thị amount, fee, asset/currency và thời hạn quote; nếu không, ghi “quote unavailable” thay vì bịa phí. |
| FR-06 | Approve batch | P0 | Chỉ Approver/Employer Admin được quyền approve; lưu actor và timestamp. |
| FR-07 | Enforce approval | P0 | `execute` bị từ chối nếu batch chưa APPROVED. |
| FR-08 | Submit payout | P0 | Batch đã approve được gửi qua 9Pay testnet adapter hoặc mock adapter được gắn nhãn rõ. |
| FR-09 | Query status | P0 | Người dùng xem được trạng thái batch và từng payout item. |
| FR-10 | Record provider reference | P0 | Khi provider trả reference, hệ thống lưu và hiển thị reference đó. |
| FR-11 | Audit trail | P0 | Tạo, validate, approve, execute, success/failure đều tạo event có timestamp và actor/system source. |
| FR-12 | Prevent duplicate submission | P0 | Retry cùng request/idempotency key không tạo thêm payout trong hệ thống; nếu provider không hỗ trợ idempotency thì tra cứu trước khi retry. |
| FR-13 | Handle uncertain result | P0 | Timeout hoặc mất kết nối chuyển sang `REQUIRES_REVIEW`/pending; không tự đánh dấu failed và submit lại mù quáng. |
| FR-14 | Provider error display | P1 | Lỗi hiển thị bằng thông báo an toàn, không lộ secret hoặc raw payload nhạy cảm. |
| FR-15 | Webhook/status polling | P1 | Nếu provider cung cấp, xác minh webhook hoặc poll trạng thái để cập nhật batch. |
| FR-16 | Stellar SEP-31 adapter | P1/Conditional | Chỉ được xem là hoàn thành khi có anchor/asset/corridor cụ thể và test transaction/lifecycle thành công. |
| FR-17 | MCP interface | P2/Conditional | MCP có thể tạo batch, validate, quote, request approval và query status; không được bypass approval. |
| FR-18 | x402 paid API | P2/Conditional | Chỉ triển khai nếu bắt buộc theo tiêu chí hackathon; chứng minh một request 402 → payment → retry với scheme/facilitator thực sự hỗ trợ. |

### MVP acceptance scenario
1. Tạo batch gồm 3 người nhận với số tiền hợp lệ.
2. Hệ thống hiển thị tổng batch chính xác.
3. Batch được validate và approve.
4. Gửi qua 9Pay testnet adapter đã xác minh, hoặc mock adapter được đánh dấu rõ nếu môi trường/endpoint gặp vấn đề.
5. Hiển thị trạng thái và provider reference cho từng item khi có.
6. Thử execute lại cùng idempotency key và xác nhận không tạo lệnh trùng.
7. Kiểm tra audit trail có đủ các bước chính.

## 4. Non-Functional Requirements (NFR)

| ID | Requirement | Mức tối thiểu cho MVP | Cách kiểm tra |
|---|---|---|---|
| NFR-01 | Security | Secrets chỉ ở backend; không commit credentials; endpoint approve/execute có auth và role check. | Kiểm tra repo, env và thử request không có quyền. |
| NFR-02 | Data integrity | Amount dùng decimal-safe representation; batch total khớp tổng items. | Unit tests với số thập phân và nhiều items. |
| NFR-03 | Idempotency | Retry không tạo payout trùng; key duy nhất cho từng item/batch. | Gửi request giống nhau nhiều lần. |
| NFR-04 | Auditability | Trạng thái quan trọng có event với actor/time/reference. | Kiểm tra event timeline. |
| NFR-05 | Reliability | Timeout không bị coi là failure chắc chắn; provider status được kiểm tra trước retry. | Mock timeout và kết quả không xác định. |
| NFR-06 | Usability | Người dùng hiểu rõ tổng tiền, trạng thái, lỗi và hành động tiếp theo. | Demo không cần giải thích miệng từng nút. |
| NFR-07 | Performance | API nội bộ thông thường phản hồi trong < 1 giây ở dữ liệu demo, không tính thời gian provider. | Đo request local. |
| NFR-08 | Maintainability | Domain logic tách khỏi provider adapter; mock và testnet dùng chung interface. | Thay adapter bằng config mà không sửa domain logic. |
| NFR-09 | Observability | Log có correlation ID, batch ID và provider reference; không ghi secret/PII thừa. | Kiểm tra log mẫu. |
| NFR-10 | Portability | Khởi động local bằng README và env example; database setup có migration/seed. | Thành viên khác clone và chạy theo hướng dẫn. |
| NFR-11 | Testability | Có unit tests cho validation/state transition/idempotency và ít nhất một end-to-end happy path. | Chạy test suite. |
| NFR-12 | Compliance boundary | Demo được đánh dấu testnet/sandbox/mock; không đưa ra claim production/legal unsupported. | Review UI, README và pitch. |

## 5. Quy tắc nghiệp vụ

- BR-01: Không gửi payout nếu batch chưa được phê duyệt.
- BR-02: Sau khi chuyển sang `PROCESSING`, không sửa amount/recipient; cần tạo batch mới nếu thay đổi.
- BR-03: Không đánh dấu thành công chỉ dựa trên việc request được gửi đi.
- BR-04: Timeout là trạng thái không xác định cho đến khi đối soát với provider.
- BR-05: Mock response phải nhận diện được ở UI, log và demo.
- BR-06: Chỉ hỗ trợ asset/currency mà provider và luồng demo thực sự hỗ trợ.
- BR-07: Không lưu thông tin cá nhân không cần thiết.
- BR-08: Mọi claim về production phải tách khỏi demo testnet và được rà soát pháp lý riêng.

## 6. Definition of Done

MVP được xem là hoàn thành khi:
- Các FR P0 đều chạy được trong một kịch bản end-to-end.
- Không thể execute khi chưa approve.
- Không tạo duplicate payout khi retry.
- Trạng thái không xác định được xử lý an toàn.
- Có audit trail và provider reference hoặc nhãn mock rõ ràng.
- Có README, `.env.example`, seed/demo data và lệnh chạy.
- Demo không yêu cầu credentials bí mật được đặt ở frontend.
