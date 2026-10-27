import subprocess
import json
import time
import os
import re

SCREENS = [
    {
        "id": "screen_1_vercel_dashboard",
        "title": "PayBridge - Vercel Minimalist Overview & Batch Directory (/)",
        "prompt": """Vercel / Geist Design System minimalist B2B dashboard. Pure white background (#FFFFFF) with subtle off-white card backgrounds (#FAFAFA), crisp 1px light gray borders (#EAEAEA), solid black primary buttons (#000000 text-white rounded-md), zero AI gradients, zero glowing neon accents.

Top Navigation Bar:
- Left: Vercel black triangle logo ▲, workspace breadcrumb "PayBridge / Acme Global Ltd (emp_acme_vn)"
- Right: "9Pay Sandbox" badge with subtle green dot, black "+ Tạo đợt chi" button, circular user avatar
- Horizontal navigation tabs below header: "Tổng quan (Overview)" [active with black bottom border], "Tạo đợt chi", "Danh bạ nhân sự", "Sổ cái kiểm toán", "Cài đặt"

Key Metrics Row (4 clean minimalist cards with 1px borders):
- Tổng tiền giải ngân: 236.450.000 ₫ (~$9.458 USD)
- Đợt chi thành công: 8 đợt chi
- Nhân sự đã nhận tiền: 24 lập trình viên & freelancer
- Cổng kết nối hoạt động: 9Pay Sandbox & NAPAS 24/7

Table Filter & Search Toolbar:
- Search input with magnifying glass: "Tìm kiếm đợt chi theo tên hoặc mã..."
- Segmented status tabs: "Tất cả (8)", "Bản nháp (1)", "Đã kiểm tra (1)", "Chờ giải ngân (2)", "Đã hoàn tất (4)"

Batch Ledger Data Table:
- Crisp 1px table border, subtle hover rows
- Columns: Tên đợt chi trả, Trạng thái (subtle pill with 6px colored dot: green for Hoàn tất, amber for Chờ ký duyệt, blue for Đã kiểm tra), Số người nhận, Tổng số tiền (monospace tabular-nums e.g. 52.000.000 ₫), Cổng thanh toán (9Pay Sandbox), Ngày tạo, Thao tác (Xem chi tiết →)

Professional enterprise SaaS, ultra-clean, minimalist Vercel/Geist aesthetics."""
    },
    {
        "id": "screen_2_vercel_batch_wizard",
        "title": "PayBridge - Vercel 3-Step Guided Settlement Wizard (/batches/new)",
        "prompt": """Vercel / Geist Design System minimalist 3-step creation wizard. White background, crisp 1px light gray borders, solid black primary buttons, zero AI gradients.

Top Navigation Bar:
- Workspace breadcrumb: "PayBridge / Acme Global Ltd / Tạo đợt chi mới"
- Active tab: "Tạo đợt chi (New Batch)"

3-Step Horizontal Stepper:
- Step 1: "1. Thông tin chung" [Completed checkmark]
- Step 2: "2. Danh sách nhân sự & Số tiền" [Active, bold black underline]
- Step 3: "3. Xem lại & Xác nhận" [Pending, light gray]

Main Content Card (Minimalist 1px border):
- Form fields:
  * Tên đợt chi trả: "Lương & Thù lao Kỹ thuật - Tháng 10/2026"
  * Cổng thanh toán: Segmented radio cards (Selected: "9Pay Sandbox - Chi hộ & NAPAS 24/7")
- Contractor Selection & Allocation Table:
  * Table listing 4 contractors: Nguyen Van An (Senior Backend - Vietcombank - 35.000.000 ₫), Tran Thi Mai (UI/UX - Techcombank - 28.000.000 ₫), Le Hoang Long (DevOps - MB Bank - 42.000.000 ₫), Pham Minh Duc (Frontend - ACB - 30.000.000 ₫)
  * Quick-add contractor dropdown input
- Summary Bar at bottom of card:
  * Tổng số tiền: 135.000.000 ₫ (BigInt lossless)
  * Số nhân sự: 4 người
  * Action buttons: Secondary "Huỷ bỏ", Primary solid black "Tiếp tục sang bước ký duyệt →"."""
    },
    {
        "id": "screen_3_vercel_command_center",
        "title": "PayBridge - Vercel Deployment Inspection & Approval Center (/batches/[id])",
        "prompt": """Vercel / Geist Design System deployment inspection page for payout batch. Minimalist white background, crisp 1px borders, high-contrast typography, zero flashy AI slop.

Top Breadcrumb & Actions:
- "← Tổng quan đợt chi / BATCH-VN-2026-10-8821"
- Title: "Chi trả Thù lao Kỹ sư Công nghệ Tháng 10" with emerald "Đã ký duyệt" badge
- Right actions: "Làm mới", "Trợ lý Rủi ro AI" button

4-Stage Deployment Timeline Stepper:
- Step 1: Bản nháp [Done checkmark]
- Step 2: Đã đối soát ngân hàng [Done checkmark]
- Step 3: CFO Ký duyệt SEC-804 [Done checkmark - Signed by Le Thu Hang]
- Step 4: Sẵn sàng giải ngân 9Pay [Active, dark highlight]

Financial Metrics Banner (4 clean boxes):
- Tổng tiền: 135.000.000 ₫ (tabular-nums)
- Người nhận: 4 nhân sự
- Cổng thanh toán: 9Pay Sandbox Testnet
- Trạng thái kiểm soát: Đã có chữ ký CFO

Action Callout Box (Clean dark slate/black container):
- "Quy trình Phê duyệt & Điều phối Giải ngân: Đã có đủ chữ ký hợp lệ. Sẵn sàng phát lệnh thanh toán đến cổng 9Pay Testnet."
- Solid white CTA button: "Giải ngân qua 9Pay (Bước 3) →"

Tabbed Panel:
- Tabs: "Danh sách thụ hưởng (4)" [Active], "Sổ cái kiểm toán (6)", "Phân tích Gemini AI"
- Clean table listing 4 beneficiaries with Bank logos (VCB, MB, TCB), Account numbers, Amounts, and 9Pay Transaction References."""
    },
    {
        "id": "screen_4_vercel_recipients",
        "title": "PayBridge - Vercel Contractor & Beneficiary Directory (/recipients)",
        "prompt": """Vercel / Geist Design System directory page. Minimalist white aesthetic, crisp 1px borders, clean typography, zero AI gradient slop.

Header:
- Title: "Danh bạ Nhân sự & Freelancer"
- Subtitle: "Quản lý hồ sơ nhận thanh toán, tài khoản ngân hàng NAPAS 24/7 và ví 9Pay của các cộng sự."
- Solid black button: "+ Thêm nhân sự mới"

Metrics Row:
- Tổng số nhân sự: 48 Người
- Đã xác thực tài khoản: 45 / 48 (green text)
- Ngân hàng & Ví hỗ trợ: VCB, MB, TCB, ACB, 9Pay
- Kiểm soát kép: Bảo vệ 100% đợt chi

Search & Filter Bar:
- Clean search input with shortcut key indicator
- Filter dropdown: "Tất cả ngân hàng", "Vietcombank", "MB Bank", "Techcombank", "Ví 9Pay"

Data Table:
- Clean table with subtle avatar circles (initials only, neutral gray)
- Columns: Họ tên nhân sự, Vị trí & Email, Kênh ngân hàng (VCB/MB/TCB badge), Số tài khoản, Trạng thái xác thực (green dot "Đã xác minh"), Tổng tiền đã nhận (tabular numbers in VND)."""
    },
    {
        "id": "screen_5_vercel_audit_ledger",
        "title": "PayBridge - Vercel Immutable Compliance & Audit Ledger (/audit)",
        "prompt": """Vercel / Geist Design System immutable audit log page. Pure white and light zinc palette, monospace font for hashes and IDs, zero AI gradients.

Header:
- Title: "Sổ cái Kiểm toán & Đối soát Giao dịch"
- Subtitle: "Ghi nhận bất biến (append-only) mọi sự kiện tạo đợt chi, đối soát ngân hàng, chữ ký CFO và mã tham chiếu từ cổng 9Pay."
- Status pill: Green dot "Sổ cái Bất biến (Append-only)"

Metrics Cards (3 minimalist cards):
- Tổng số sự kiện: 142 bản ghi
- Chữ ký Kiểm soát kép (CFO): 18 Lượt duyệt SEC-804
- Bảo mật & Dữ liệu riêng tư: Khử định danh 100%

Filter Bar:
- Search input: "Tìm theo người thực hiện, tên đợt chi hoặc mã..."
- Event filter dropdown: "Tất cả sự kiện", "BATCH_CREATED", "BATCH_VALIDATED", "BATCH_APPROVED", "BATCH_EXECUTION_COMPLETED"

Audit Ledger Table:
- Monospace timestamps (e.g. 26/10/2026, 13:45:10)
- Event badge: BATCH_APPROVED (neutral border pill), BATCH_EXECUTION_COMPLETED (green dot)
- Đợt chi trả liên quan (link)
- Người thực hiện (monospace actorId e.g. executive_cfo_signoff)
- Chuyển trạng thái (VALIDATED → APPROVED)
- Dữ liệu đối soát."""
    },
    {
        "id": "screen_6_vercel_settings",
        "title": "PayBridge - Vercel Settlement Rails & Financial Invariant Engine (/settings)",
        "prompt": """Vercel / Geist Design System settings and invariant configuration page. Clean white background, minimalist cards with 1px gray borders, monospace badges.

Header:
- Title: "Cấu hình Kênh Thanh toán & Nguyên tắc An toàn"
- Subtitle: "Thiết lập adapter cổng chi hộ 9Pay, cơ chế mô phỏng an toàn và các nguyên tắc bảo vệ tài chính bất biến."

Section 1: Các Kênh Kết nối & Cổng Thanh toán (3 cards grid):
- Card 1: "9Pay Vietnam Gateway" (Testnet Chi Hộ badge, Endpoint: sandbox.9pay.vn, NAPAS 24/7 & Ví 9Pay)
- Card 2: "Mock Payout Simulator" (Đang hoạt động badge, Latency: 500ms, Tỷ lệ thành công 100%)
- Card 3: "Stellar SEP-31 Anchor Rail" (Giai đoạn 2 badge, mờ nhẹ, Nằm ngoài MVP đầu tiên)

Section 2: Các Nguyên tắc An toàn Tài chính Bất biến (Financial Invariants):
- 4 Clean callout cards:
  1. Toán học Chính xác Tuyệt đối (Lossless Math - BigInt, zero float)
  2. Kiểm soát kép Phê duyệt (SEC-804 / BR-01 - CFO sign-off required)
  3. Khoá Chống Trùng lặp Giao dịch (Idempotency Key UNIQUE constraint)
  4. Tuyệt đối Không để Lộ Bí mật (Zero Secrets in Git)

Section 3: Quy tắc An toàn AI:
- Advisory only clarification, no money-movement authority."""
    },
    {
        "id": "screen_7_vercel_modals",
        "title": "PayBridge - Vercel Minimalist Dialogs & Gemini AI Advisory Drawer",
        "prompt": """Vercel / Geist Design System dialogs and drawer showcase. Clean white modal dialogs with 1px subtle gray borders, solid black action buttons, crisp typography, zero AI gradients.

Dialog 1: Ký duyệt Chi trả Kiểm soát kép (SEC-804 Dual-Control Signoff Modal):
- Clean white box with 1px border
- Title: "Ký duyệt Chi trả Kiểm soát kép"
- CFO Name input field, Security PIN password field
- Checkbox: "Tôi xác nhận đã đối soát đầy đủ danh sách và số tài khoản của 4 nhân sự. Đồng ý cấp phép giải ngân."
- Actions: Secondary "Huỷ bỏ", Primary solid black "Ký duyệt & Cho phép giải ngân"

Dialog 2: Điều phối Giải ngân qua Cổng 9Pay (Settlement Dispatch Modal):
- Progress state showing 3 clean steps:
  1. Kiểm tra chữ ký CFO & khoá Idempotency (Green check)
  2. Bắt tay kết nối cổng 9Pay Chi Hộ Sandbox (Green check)
  3. Chuyển mạch liên ngân hàng NAPAS 24/7 (Clean loader)
- Black action button: "Xác nhận & Giải ngân ngay"

Slide-over Drawer (Right edge): Trợ lý Rủi ro Gemini AI (Advisory Drawer):
- Clean white panel with 1px left border
- Anomaly risk meter: 0.04 / 10.0 (An toàn)
- Quick prompt buttons: "🔍 Quy định thuế TNCN 10%", "🏦 Kiểm tra tính tương thích NAPAS 24/7", "📋 Soạn biên bản tóm tắt gửi Ban Giám đốc"
- AI Memo callout with neutral gray background."""
    }
]

out_dir = "/Users/admin/repos/PayBridge/docs/stitch_designs"
os.makedirs(out_dir, exist_ok=True)

def main():
    token = subprocess.check_output(['gcloud', 'auth', 'print-access-token']).decode().strip()
    env = {
        'PATH': '/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin',
        'STITCH_ACCESS_TOKEN': token,
        'STITCH_PROJECT_ID': 'gen-lang-client-0269711937',
        'GOOGLE_CLOUD_PROJECT': 'gen-lang-client-0269711937'
    }
    
    results = []
    for item in SCREENS:
        print(f"\n==========================================")
        print(f"Triggering generation: {item['title']}")
        print(f"==========================================")
        payload = {
            "projectId": "17630592157029980084",
            "prompt": f"{item['title']}\n\n{item['prompt']}",
            "deviceType": "DESKTOP"
        }
        res = subprocess.run(
            ['npx', '-y', '@_davideast/stitch-mcp', 'tool', 'generate_screen_from_text', '-d', json.dumps(payload)],
            capture_output=True, text=True, env=env
        )
        print("Return code:", res.returncode)
        target_path = os.path.join(out_dir, f"{item['id']}.json")
        with open(target_path, "w") as f:
            f.write(res.stdout)
            
        screen_name = "unknown"
        screenshot_url = ""
        # Search via regex since stdout might truncate
        name_match = re.search(r'"name":\s*"([^"]+)"', res.stdout)
        if name_match:
            screen_name = name_match.group(1)
        url_match = re.search(r'"downloadUrl":\s*"([^"]+)"', res.stdout)
        if url_match:
            screenshot_url = url_match.group(1)
            
        print(f"  -> Generated Screen: {screen_name}")
        if screenshot_url:
            print(f"  -> Screenshot Download URL: {screenshot_url[:80]}...")
            
        results.append({
            "id": item["id"],
            "title": item["title"],
            "screen_name": screen_name,
            "screenshot_url": screenshot_url
        })
        time.sleep(1)

    summary_file = os.path.join(out_dir, "stitch_vercel_summary.json")
    with open(summary_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nAll screens generated! Summary saved to {summary_file}")

if __name__ == '__main__':
    main()
