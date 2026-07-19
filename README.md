# 💰 Automated Affiliate Payout & Wallet Management System

A high-performance, production-grade **Low-Level Design (LLD)** implementation built using **Node.js, Express, and Prisma ORM with PostgreSQL**. This system handles real-time affiliate sale tracking, automated fraction advance payouts, dynamic administrative reconciliation, and automated transaction failure recovery loops.

---

## 🏗️ 1. Low-Level Design (LLD) & Architecture

The application strictly follows the **Repository & Service Pattern** decoupling paradigm to isolate infrastructure layers from administrative core calculation components.

## 🏗️ Project Architecture

```text
┌────────────────────────────────────────────────────────┐
│                     Express Router                     │
│          Receives HTTP Requests & Routes APIs          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Controller Layer                      │
│     Handles Request, Response & Error Management       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Service Layer                        │
│      Contains Business Logic & Core Workflow           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Repository Layer                       │
│          Performs Database Operations Only             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Prisma ORM                          │
│        Converts JS Queries into SQL Statements         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  PostgreSQL (Neon)                     │
│               Persistent Database Storage              │
└────────────────────────────────────────────────────────┘
```


### 🧠 Core Class/Module Architecture (Equivalent System Interfaces)
*   **`saleService` / `saleRepository`**: Handles onboarding new revenue rows and locks transaction logs during admin verification cycles.
*   **`payoutService`**: The automated calculation engine managing fractional cash flows and ensuring batch idempotency.
*   **`withdrawalService`**: Manages user ledgers, enforces rate-limiting constraints, and triggers immediate asset restorations on outer network failure frames.

---

## 🗂️ 2. Database Schema & Relationships

To neutralize rounding limits and ensure zero data loss during fractional currency evaluations, all ledger components are backed by the **PostgreSQL `Decimal(12, 2)` type** instead of native JavaScript floating-point representations.

### ER Diagram Entity Models

#### 👤 User Model
*   `id` (`String`, CUID, Primary Key)
*   `name` (`String`)
*   `email` (`String`, Unique Index Constraint)
*   `withdrawableBalance` (`Decimal(12, 2)`, Liquidity Storage)
*   `lastWithdrawalAt` (`DateTime`, Nullable Velocity Indexer)

#### 🏷️ Brand Model
*   `id` (`String`, CUID, Primary Key)
*   `name` (`String`, Unique Index Constraint)

#### 🛒 Sale Model (`User 1 ── 🔗 ── ⚬ N Sales`)
*   `id` (`String`, CUID, Primary Key)
*   `userId` (`String`, Foreign Key ── `User.id`)
*   `brandId` (`String`, Foreign Key ── `Brand.id`)
*   `earning` (`Decimal(12, 2)`)
*   `status` (`Enum: PENDING, APPROVED, REJECTED`)
*   `advancePaid` (`Boolean`, Idempotency Flag)
*   `advanceAmount` (`Decimal(12, 2)`)

#### 💳 Payout Model (`Sale 1 ── 🔗 ── ⚬ N Payouts`)
*   `id` (`String`, CUID, Primary Key)
*   `saleId` (`String`, Foreign Key ── `Sale.id`)
*   `userId` (`String`, Foreign Key ── `User.id`)
*   `type` (`Enum: ADVANCE, FINAL, ADJUSTMENT`)
*   `amount` (`Decimal(12, 2)`)
*   `status` (`Enum: PENDING, SUCCESS, FAILED`)

#### 📥 Withdrawal Model (`User 1 ── 🔗 ── ⚬ N Withdrawals`)
*   `id` (`String`, CUID, Primary Key)
*   `userId` (`String`, Foreign Key ── `User.id`)
*   `amount` (`Decimal(12, 2)`)
*   `status` (`Enum: PENDING, SUCCESS, FAILED, CANCELLED, REJECTED`)

---

## 🔌 3. Core API Documentation Endpoints

### 📌 Affiliate Sales Node
*   `POST /sales` — Registers a new raw merchant pending sale object.
*   `PATCH /sales/reconcile/:id` — Administrative pipeline calculation entry. Passes `{"status": "APPROVED" | "REJECTED"}`.

### 📌 Automated Payout Engine
*   `POST /payouts/advance` — Batched script calculation processing 10% cash advances to affiliates.

### 📌 Liquidity Withdrawal Node
*   `POST /withdrawals` — Validates ledger liquidity bounds and processes user disbursement requests.
*   `PATCH /withdrawals/:id/status` — Network callback ingestion tool managing failure state recoveries.

---

## 🛡️ 4. Edge Cases & Exception Resiliency Matrix

| Scenario Target | Engineering Mitigation Implementation |
| :--- | :--- |
| **Batch Job Redundancy** | Employs explicit state tracking flags (`advancePaid`) ensuring zero duplication windows on cron cycles. |
| **Race Condition Clicks** | Leverages atomic transactional boundaries (`prisma.$transaction`) enforcing state consistency across distributed calls. |
| **24-Hour Velocity Drainage** | Dynamically verifies temporal historical timestamps (`lastWithdrawalAt`) preventing continuous rapid balance liquidation[cite: 9]. |
| **External Channel Failures** | Implements automated recovery callbacks restoring original cash metrics back into live balance states instantly[cite: 9]. |

---

## ⚡ 5. Design Decisions & Engineering Trade-offs
*   **Atomic Transactions over Code Loops:** All operational processes are unified inside single transactional isolation boundaries. If an intermediate database step fails mid-flight, the system rolls back all updates to eliminate data corruption.
*   **CUID Identifiers:** CUID tokens were chosen over sequential numeric autoincrements to mask database analytics from outer inspection and prevent sequence guessing exploits.
