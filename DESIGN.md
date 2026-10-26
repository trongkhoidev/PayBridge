# Design System Specification (Stitch Design) — PayBridge

> **Google Stitch Ready**: This design specification and its companion screen prompts in [`docs/GOOGLE_STITCH_DESIGN_SPEC.md`](file:///Users/admin/repos/PayBridge/docs/GOOGLE_STITCH_DESIGN_SPEC.md) are calibrated for **Google Stitch** (Google Labs AI UI Prototyping).

## 1. Design Vision & Philosophy
**PayBridge** provides multinational finance teams, HR managers, and founders with an executive, institutional-grade settlement portal for contractor and freelancer payrolls in Vietnam. 
 

- **Fintech Precision & Trust**: High-contrast, clean elevation inspired by top-tier financial software (Stripe, Mercury, Wise). Every figure is displayed with lossless decimal fidelity.
- **Cognitive Clarity & Progressive Disclosure**: Multi-step payout lifecycle (`Draft` → `Validated` → `Approved` → `Processing` → `Completed`) with clear visual progress tracks, ensuring approvers always understand what they are signing off on.
- **Zero Engineering Slop**: Technical internals like idempotency keys and checksum hashes are cleanly tucked into inspectable badges or audit drawers, keeping the core executive workflow distraction-free.
- **Strict Compliance & Separation of Duties**: The UI explicitly enforces the dual-control principle: a batch cannot be executed without executive approval. Clear sandbox/testnet banners ensure demo safety.

---

## 2. Color Palette & Semantics

| Token | Class / Hex | Semantic Meaning |
|---|---|---|
| **Canvas Background** | `bg-slate-50/70` (`#f8fafc`) | Clean, neutral backdrop canvas |
| **Card Surface** | `bg-white border border-slate-200/80 shadow-sm` | Primary elevated surfaces for lists & tables |
| **Sidebar / Navigation** | `bg-slate-900 text-slate-100` | High-contrast, authoritative navigation rail |
| **Primary Brand / Action** | `bg-indigo-600 hover:bg-indigo-700 text-white` | Primary calls to action, creation buttons |
| **Approval / Success State** | `bg-emerald-50 text-emerald-700 border-emerald-200` | Approved batches, successful 9Pay dispatches |
| **Validation / Info State** | `bg-blue-50 text-blue-700 border-blue-200` | Validated recipient accounts, pre-flight checks |
| **Sandbox / Warning State** | `bg-amber-50 text-amber-800 border-amber-300` | Testnet badges, mock simulator alerts |
| **Review / Flagged State** | `bg-orange-50 text-orange-800 border-orange-200` | Batches requiring manual reconciliation |
| **Destructive / Error State** | `bg-rose-50 text-rose-700 border-rose-200` | Rejected items, invalid bank accounts |

---

## 3. Typography & Financial Data Hierarchy
- **Primary Font**: System font stack (`-apple-system`, `BlinkMacSystemFont`, `Inter`, `Segoe UI`) for crisp legibility.
- **Financial Monospace**: `font-mono tracking-tight` for all currency amounts (VND, USDC), bank account numbers, transaction hashes, and idempotency keys.
- **Executive KPI Numbers**: `text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900`.
- **Page Titles**: `text-xl sm:text-2xl font-bold tracking-tight text-slate-900`.
- **Section Headers**: `text-sm font-semibold uppercase tracking-wider text-slate-500`.
- **Status Pills**: `text-xs font-semibold px-2.5 py-0.5 rounded-full border`.

---

## 4. Multi-Page Navigation Architecture

```
PayBridge Platform Shell
├── 📊 Overview & Batches (/)              -> Live KPIs, batch filter table, quick demo trigger
├── ➕ New Batch Wizard (/batches/new)     -> 3-step structured creation flow with lossless audit
├── 🔍 Batch Command Center (/batches/[id]) -> Step-by-step approval, execution, AI advisor, audit log
├── 👥 Contractor Vault (/recipients)      -> Beneficiary directory with Vietnamese bank accounts
├── 📜 Audit & Settlement Ledger (/audit)  -> Immutable event logs, actor tracking, idempotency records
└── ⚙️ Payment Rails & Config (/settings)  -> 9Pay adapter health, mock parameters, security invariants
```

---

## 5. Key Component Standards

### A. Lifecycle Progress Tracker
A 4-node interactive horizontal progress stepper showing real-time batch lifecycle:
1. `Draft` (Data Entry)
2. `Validated` (Account & Quota Check)
3. `Approved` (Executive Sign-off)
4. `Settled` (9Pay Testnet Dispatched)

### B. Dual-Control Approval Gate
A high-prominence action card that disables the **Execute Payout** button until a designated Approver signs off. Once signed, records actor ID and timestamp into the immutable audit trail.

### C. Gemini AI Risk & Payout Advisor
A read-only advisory drawer providing:
- Natural language batch summary (Total disbursed, beneficiary breakdown).
- High-value batch alerts (> 100M VND threshold).
- Clear compliance boundary reminder: *AI cannot authorize financial execution.*

### D. Recipient Data Table
Clean, data-dense tabular display featuring:
- Beneficiary full name with avatar initials.
- Bank code badge (VCB, MB, Techcombank, 9Pay Wallet).
- Masked account/phone number with copy action.
- Integer-safe formatted amounts (e.g., `15,000,000 VND`).
- Real-time provider reference ID once processed (`MOCK-9PAY-TXN-...`).
