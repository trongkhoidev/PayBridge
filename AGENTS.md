# PayBridge — AGENTS.md

Shared instructions for **Claude Code**, **Codex**, **agy**, and **OpenCode**.

---

## 1. Project Overview & Kickoff Blueprint

**PayBridge** is a modern payment bridging and settlement service.

When starting this project from scratch:
- **Spec-First (Grilling)**: Run `/grill-me` or `/grill-with-docs` to define the architecture, supported payment rails (crypto/fiat), and database schemas before writing implementation code.
- **Save Specs**: Write initial requirements and ADRs into `docs/` as Markdown.
- **Stack Standard**: Prefer **TypeScript (strict)**, **pnpm** (or **Bun**), with modular/hexagonal layering.

---

## 2. Token Optimization & Code Efficiency (Ponytail)

- **Ponytail Ladder of Laziness**:
  1. Does this feature need to exist in MVP? (Strict YAGNI).
  2. Does standard library or native platform features cover it?
  3. Reuse established utilities; do not write premature abstractions or multi-layered wrappers until concrete requirements demand them.
  4. Write the **Shortest Working Diff**.
- **Context Packing**: Once the repository grows, use `repomix --compress` for compact context ingestion when performing code reviews.
- **Code Navigation**: Initialize Codegraph (`codegraph init`) once core source files are created.

---

## 3. Security & Financial Invariants

- **Idempotency**: All payment and transfer operations MUST be idempotent via unique idempotency keys (`UNIQUE(idempotency_key, tenant_id)`).
- **Amounts & Precision**: Currency and token amounts MUST use lossless representation (`bigint` or `decimal/NUMERIC`). Never use floating-point numbers (`number` / `float`) for monetary values.
- **Zero Secrets in Git**: API keys, private keys, and webhooks must strictly load from environment variables.
