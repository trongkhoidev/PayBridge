# PayBridge — Implementation Plan

## 1. Nguyên tắc lập kế hoạch

Chỉ giải quyết một vấn đề: **giúp doanh nghiệp tạo, phê duyệt và theo dõi payout cho nhân viên/freelancer tại Việt Nam**.

Đã có tài khoản 9Pay testnet được cấp quyền chi hộ, vì vậy 9Pay là provider ưu tiên cho luồng demo. Vẫn cần kiểm tra chính xác endpoint, auth, payload và status API theo tài liệu tài khoản; không tự giả định API shape.

Stellar SEP-31 chỉ là phần tích hợp thêm khi có anchor/corridor tương thích đã xác minh. x402 và MCP không được làm chệch trọng tâm payroll payout. MCP là một giao diện phụ; x402 chỉ làm nếu hackathon yêu cầu hoặc còn thời gian sau khi luồng payout ổn định.

## 2. Phân bổ phạm vi

### P0 — bắt buộc
- Tạo batch.
- Nhập và validate recipient/amount.
- Tính tổng.
- Approve.
- Execute qua 9Pay testnet.
- Tra cứu trạng thái và hiển thị reference.
- Audit trail.
- Idempotency/duplicate prevention.
- Error handling và demo seed.

### P1 — chỉ sau khi P0 ổn định
- SEP-31 anchor integration thực sự.
- Webhook nếu 9Pay cung cấp.
- MCP tools cho batch/status/approval.
- Quote/fee thật nếu provider hỗ trợ.

### P2 — không cam kết cho bản MVP
- x402 paid API flow.
- Multi-chain.
- ZK proof.
- Smart contract riêng.
- Auto FX/liquidity.
- KYC/AML engine tự xây.
- Production deployment xử lý tiền thật.

## 3. Chuẩn bị trước hackathon — 30%

### Task A — Xác minh 9Pay (ưu tiên cao nhất)
- [ ] Đọc tài liệu sandbox/testnet được cấp.
- [ ] Xác minh base URL và endpoint chi hộ.
- [ ] Xác minh authentication/signature và timestamp/nonce nếu có.
- [ ] Xác minh recipient fields, amount format, currency và validation rules.
- [ ] Xác minh API trả provider reference nào.
- [ ] Xác minh query status và trạng thái terminal.
- [ ] Xác minh idempotency hoặc quy trình tra cứu trước retry.
- [ ] Xác minh webhook/signature nếu hỗ trợ.
- [ ] Chạy một payout test end-to-end.
- [ ] Lưu request/response đã redact vào fixtures; không lưu secrets.

**Exit criteria:** có một script nhỏ gửi payout test thành công và lấy được trạng thái/reference, hoặc đã xác định rõ phần nào bị chặn để chuẩn bị mock adapter.

### Task B — Khóa domain model và API contract
- [ ] Định nghĩa `PayrollBatch`, `PayoutItem`, `AuditEvent`.
- [ ] Định nghĩa state machine và lỗi nội bộ.
- [ ] Tạo endpoints create/validate/approve/execute/status.
- [ ] Quy định idempotency key và behavior khi timeout.
- [ ] Viết OpenAPI hoặc API contract ngắn.

**Exit criteria:** frontend có thể xây độc lập với provider bằng API contract đã chốt.

### Task C — Xây nền backend
- [ ] Khởi tạo project và database migration.
- [ ] Viết validation và decimal-safe amount utility.
- [ ] Viết provider interface.
- [ ] Viết mock adapter cùng interface với 9Pay adapter.
- [ ] Viết unit tests cho validation, state transitions, approval và duplicate prevention.
- [ ] Tạo seed data.

**Exit criteria:** API chạy với mock, test cơ bản pass.

### Task D — Tích hợp provider
- [ ] Implement 9Pay adapter theo tài liệu thực.
- [ ] Map provider status sang internal status.
- [ ] Xử lý timeout, error code và unknown outcome.
- [ ] Thử lại với idempotency/lookup strategy an toàn.
- [ ] Thêm status polling/webhook nếu được hỗ trợ.

**Exit criteria:** happy path chạy được trên 9Pay testnet hoặc có fallback mock rõ ràng đã được test.

### Task E — POC tùy chọn
- [ ] SEP-31: xác định anchor và test lifecycle riêng.
- [ ] MCP: expose các use case backend; không duplicate business logic.
- [ ] x402: chọn scheme/facilitator thực sự hỗ trợ và chứng minh một paid request.

Không bắt đầu POC tùy chọn trước khi Tasks A–D có tiến triển chắc chắn.

## 4. Ngày hackathon — hoàn thiện 70% trong một ngày

Giả định 8 giờ làm việc hữu ích, 2 thành viên.

| Giờ | Thành viên A — Backend/Integration | Thành viên B — Frontend/Product |
|---|---|---|
| 09:00–09:30 | Chạy test provider, chốt API contract | Chạy app, chốt màn hình cần hoàn thiện |
| 09:30–11:00 | Hoàn thiện batch service, approval, execute | Form tạo batch và danh sách recipients |
| 11:00–12:00 | Kết nối 9Pay testnet; chuẩn hóa status/error | Validate form, tổng tiền và review screen |
| 12:00–13:00 | Nghỉ; sau đó kiểm tra tích hợp | Nghỉ; sau đó kiểm tra tích hợp |
| 13:00–14:30 | Idempotency, provider status, audit trail | Batch detail, trạng thái từng payout, history |
| 14:30–15:30 | Kết nối API/MCP nếu thuộc scope bắt buộc | Kết nối API và xử lý loading/error |
| 15:30–16:15 | Chạy E2E, sửa lỗi P0 | Sửa UI, thêm nhãn testnet/mock |
| 16:15–17:00 | Freeze feature, kiểm tra retry/unknown outcome | Chuẩn bị demo data và pitch |
| 17:00–18:00 | Chạy rehearsal cuối, chỉ sửa blocker | Rehearsal, README, video/ảnh dự phòng |

### Quy tắc thời gian
- 11:00: tạo batch và validate chạy được.
- 13:00: approve → execute đã kết nối được với adapter.
- 15:00: happy path end-to-end chạy được.
- 16:15: không thêm feature mới.
- 17:00: freeze code trừ lỗi chặn demo.

Nếu hackathon có giờ bắt đầu/kết thúc khác, giữ nguyên các mốc theo tỷ lệ và ưu tiên freeze sớm.

## 5. Phân công theo ownership

### Thành viên A — Backend/Payments
- Domain model, database, state machine.
- 9Pay testnet adapter.
- Idempotency, timeout, status reconciliation.
- API, audit trail, optional MCP.
- Integration/E2E tests.

### Thành viên B — Frontend/Demo
- Dashboard batch list.
- Create batch + recipient form.
- Review/approve screen.
- Batch detail/status timeline.
- Error/loading/empty states.
- Seed demo, README, pitch assets.

### Shared
- Chốt API contract trước khi code song song.
- Mỗi module có một owner.
- Merge sớm và thường xuyên; không để hai người sửa cùng file.
- Kiểm tra demo end-to-end ít nhất ba lần trước deadline.

## 6. Kịch bản demo (3 phút)

1. **Problem (20 giây):** doanh nghiệp phải xử lý payout cho nhiều freelancer và cần kiểm soát trạng thái.
2. **Create batch (35 giây):** nhập ba người nhận, nhập amount và xem tổng.
3. **Validate/approve (35 giây):** hệ thống báo lỗi dữ liệu nếu có; approver xác nhận batch.
4. **Execute (45 giây):** gửi lệnh qua 9Pay testnet payout adapter đã được cấp quyền chi hộ.
5. **Track result (30 giây):** hiển thị provider reference và trạng thái nhận được từ testnet.
6. **Reliability (15 giây):** retry cùng request không tạo lệnh trùng; audit trail ghi lại ai đã approve.

Nếu giao dịch chạy qua mock, nói rõ đó là mock. Không mô tả mock là payout 9Pay thật.

## 7. Rủi ro và phương án dự phòng

| Rủi ro | Giảm thiểu |
|---|---|
| 9Pay API có yêu cầu đặc thù | Xác minh và test trước hackathon; giữ fixture đã redact. |
| Timeout sau khi gửi payout | Tra cứu status/reference trước khi retry; chuyển `REQUIRES_REVIEW` nếu chưa rõ. |
| Không có idempotency phía provider | Tạo internal idempotency; khóa batch; lookup trước mọi retry. |
| SEP-31 anchor không phù hợp | Không đặt trong critical path; demo payout qua 9Pay adapter. |
| x402 mất thời gian | Bỏ khỏi MVP nếu không phải tiêu chí bắt buộc. |
| Frontend/API mismatch | Chốt contract trước; dùng mock server/fixtures. |
| Demo network lỗi | Có mock adapter được gắn nhãn; không giả lập thành giao dịch thật. |
| Phạm vi phình to | P0 là điều kiện hoàn thành; P1/P2 không được chặn demo. |

## 8. Checklist release/demo

- [ ] `.env` không được commit.
- [ ] `.env.example` có đầy đủ tên biến, không có secrets.
- [ ] Có seed/reset demo data.
- [ ] Batch không execute trước approval.
- [ ] Retry không tạo duplicate.
- [ ] Timeout không tự động thành failed.
- [ ] UI hiển thị testnet/sandbox/mock.
- [ ] Provider reference được lưu khi có.
- [ ] Logs không chứa credentials hoặc dữ liệu nhạy cảm.
- [ ] README có lệnh cài đặt/chạy/test.
- [ ] Đã rehearsal trên đúng máy và mạng dùng để demo.
- [ ] Có video/screenshot dự phòng.

## 9. Điều kiện dừng phạm vi

Nếu còn dưới 2 giờ:
1. Không thêm x402, ZK, SEP-31 hoặc MCP mới.
2. Chỉ sửa lỗi P0.
3. Đảm bảo batch → approve → execute → status chạy.
4. Nếu provider không khả dụng, chuyển sang mock có nhãn rõ.
5. Chốt README và rehearsal.

## 10. Sau hackathon
- Rà soát mô hình pháp lý và hợp đồng provider trước production.
- Xác minh luồng tiền/asset/currency và điều kiện payout.
- Thêm bảo mật, phân quyền, monitoring, reconciliation và incident handling.
- Chỉ tích hợp SEP-31/x402 khi chúng giải quyết một yêu cầu đã xác định, không phải chỉ để tăng số lượng công nghệ trong pitch.
