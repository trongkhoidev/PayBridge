import subprocess
import json
import time
import os

SCREENS = [
    {
        "id": "screen_4_recipients",
        "title": "PayBridge - Beneficiary & Contractor Vault (/recipients)",
        "prompt": """Dark institutional B2B financial terminal UI (#0A0E17 background, slate borders, emerald and electric blue accents).
Contractor & Beneficiary Directory for cross-border payroll to Vietnam.
Header: Contractor & Beneficiary Vault, "+ Add Beneficiary" emerald button, "Import CSV" button.
Top KPI bar:
- Total Contractors: 48 active
- NAPAS 24/7 Verified: 45 banks
- 9Pay E-Wallets: 3 connected
- Disbursed YTD: 8,450,000,000 VND (~$338,000 USD)
Filter and search toolbar: Search contractor name/tax ID, Bank filter pills (All, Vietcombank VCB, MB Bank, Techcombank TCB, ACB, 9Pay), Status filter.
Table listing:
- Contractor Name, avatar, role (e.g. "Nguyen Van An - Senior Backend Lead", "Tran Thi Mai - UI/UX Designer", "Le Hoang Long - DevOps Engineer")
- Routing Rail: Bank Name (VCB/MB/TCB) + Account Number + NAPAS 24/7 Realtime badge
- National ID / Tax Code (for PIT deduction)
- Total Received (formatted in VND)
- Status badge (Emerald "NAPAS Verified")
- Action dropdown
A slide-over modal on the right displays "Add Contractor to Vault" with fields: Full Legal Name, Bank Selection dropdown, Account Number, Auto-lookup NAPAS Account Name button, Tax ID, and Save button.
Professional enterprise typography, clean monochrome borders, sandbox testnet badge."""
    },
    {
        "id": "screen_5_audit",
        "title": "PayBridge - Immutable Compliance & Settlement Audit Ledger (/audit)",
        "prompt": """Dark institutional B2B financial terminal UI (#0A0E17 slate dark theme).
Immutable compliance audit trail and idempotency tracking table for cross-border Vietnamese payouts.
Header: Compliance & Settlement Ledger, 'Export Immutable Log (JSON/CSV)' button, 'Verify Cryptographic Hashes' button.
Metrics cards:
- Total Audit Events: 1,420 events recorded
- Idempotency Replays Prevented: 14 replay attacks blocked
- Dual-Control Signoffs: 48 verified approvals
- Hash Consistency: 100% SHA-256 match
Filter bar: Event Type filter (All, CREATED, VALIDATED, APPROVED, EXECUTED, REPLAY_DETECTED), Actor role filter, Date range, Search by Batch ID / Idempotency Key.
Main Audit Trail Table:
- Timestamp (ISO 8601 UTC + Vietnam ICT + relative e.g. '2 mins ago')
- Batch ID & Name (link e.g. #PB-VN-9821 'October Contractor Payout')
- Action & Stage (color-coded badge: APPROVED - Dual Control Signed, EXECUTED - 9Pay Rail Dispatched)
- Actor & Identity (avatar, 'CFO Le Thu Hang (executive_cfo_signoff)' or 'Ops Lead (admin_treasury_ops)')
- Idempotency Key (mono font EXEC-b7f3-1729864200, copy button)
- Cryptographic Proof / Signature Digest (mono truncated sha256:4a8f9b...e21c)
- Verification Status (emerald checkmark 'Signature Valid')
Side panel showing selected audit record details with full payload diff, IP address, and security attestation.
Enterprise dark mode with high-contrast text and sandbox testnet badge."""
    },
    {
        "id": "screen_6_settings",
        "title": "PayBridge - Multi-Rail Settlement Settings & Invariants Engine (/settings)",
        "prompt": """Dark institutional B2B financial terminal UI (#0A0E17 theme).
System settings, payment rails orchestration, and financial invariant monitors for PayBridge.
Header: Settlement Rails & Invariant Configuration, with 'Save Changes' and 'Test Rail Handshake' buttons.
Section 1: Active Payment Rails:
- 9Pay Vietnam Sandbox Adapter: Status (Connected - Testnet), Endpoint (https://sandbox.9pay.vn/v1/payout), Rail Type (Domestic Bank Transfer via NAPAS 24/7 & 9Pay E-Wallet), Merchant ID (masked), Secret Key (masked), Webhook Signature verification status.
- Mock Fallback Simulator: Toggle switch (Active), Simulated latency (650ms), Success rate slider (99.8%).
- Stellar SEP-31 Cross-Border Bridge: Status badge (Planned / In Verification), Info alert explaining foreign FX anchor verification requirements before mainnet enablement.
Section 2: SEC-804 & Financial Invariant Enforcers:
- Lossless Arithmetic Mode: Checked & Locked (BigInt / NUMERIC, zero floating-point math).
- Dual-Control Governance: Checked (Batches cannot execute without APPROVED status sign-off from distinct executive).
- Idempotency Strict Lock: Checked (UNIQUE key enforcement per tenant).
Section 3: Tenant & Webhook Notifications: Slack & Email alerts on payout batch completion or exception."""
    },
    {
        "id": "screen_7_modals",
        "title": "PayBridge - Dual-Control Sign-off, Live 9Pay Dispatch & Gemini AI Risk Modals & Drawers",
        "prompt": """Dark institutional B2B financial UI (#0A0E17 background) showcasing the complete interactive modal, dialog, and drawer system of PayBridge:
1. Centered Modal 1: 'Executive Dual-Control Sign-off (SEC-804)'
   - Header with Shield icon
   - Batch summary: Batch #PB-VN-9821, Total 125,000,000 VND, 3 Recipients
   - Mandatory compliance checkbox: 'I verify under penalty of administrative sanctions that this payout has been reconciled against approved contractor timesheets'
   - FIDO2 Biometric / PIN authorization input box with Touch ID fingerprint icon
   - 'Reject Batch' button and emerald 'Sign & Approve Batch' button
2. Centered Modal 2: 'Live 9Pay Sandbox Settlement Dispatch'
   - Active disbursement progress modal with 4 animated step indicators:
     * Step 1: Verifying Executive Dual-Control Signature (Green checkmark)
     * Step 2: Handshaking 9Pay Payout Gateway Sandbox (Green checkmark)
     * Step 3: Routing NAPAS 24/7 Realtime Bank Rails (Active spinner with animated pulse)
     * Step 4: Settlement Receipt Generated (Pending)
   - Shows provider transaction reference MOCK-9PAY-TXN-1729864201000 and live timer
3. Slide-Over Drawer 3 (Right edge): 'Gemini AI Risk & Compliance Advisory'
   - Header with Gemini Sparkle icon
   - Anomaly Risk Meter (0.04 / 10.0 - Low Risk green gauge)
   - Batch Intelligence Analysis memo
   - Tax PIT 10% Withholding Calculator breakdown table (Gross VND vs Withholding 10% vs Net Disbursed)
   - High-Value Payment threshold alerts (>100M VND notification)
   - Quick prompt buttons: 'Generate Board Memo', 'Verify NAPAS Routing'."""
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
        if res.returncode == 0:
            target_path = os.path.join(out_dir, f"{item['id']}.json")
            with open(target_path, "w") as f:
                f.write(res.stdout)
            print(f"Saved response to: {target_path}")
            try:
                data = json.loads(res.stdout)
                components = data.get("outputComponents", [])
                for c in components:
                    if "design" in c:
                        screens = c["design"].get("screens", [])
                        for s in screens:
                            print("  -> Screen Name:", s.get("name"))
                            print("  -> Screen Title:", s.get("title") or s.get("screenMetadata", {}).get("displayName"))
                            if "screenshot" in s:
                                print("  -> Screenshot URL:", s["screenshot"].get("downloadUrl"))
            except Exception as e:
                print("JSON parsing note:", e)
        else:
            print("Error stderr:", res.stderr)
        time.sleep(2)

if __name__ == '__main__':
    main()
