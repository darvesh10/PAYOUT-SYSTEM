# Affiliate Payout & Wallet Management System

A comprehensive, production-grade Low-Level Design (LLD) implementation for tracking user affiliate sales, automated fractional advance payouts, dynamic reconciliation engines, and explicit transaction failure recovery loops.

## 🏗️ System Architecture & LLD Decisions
The application strictly follows the **Repository & Service Pattern** decoupled layer paradigm to separate raw database abstractions from administrative domain calculations.

┌────────────────────────────────────────────────────────┐
│                   Express Router                       │
└───────────────────────────┬────────────────────────────┘
▼
┌────────────────────────────────────────────────────────┐
│                 Controller Framework                   │
└───────────────────────────┬────────────────────────────┘
▼
┌────────────────────────────────────────────────────────┐
│                 Service Layer (Business Logic)         │
└───────────────────────────┬────────────────────────────┘
▼
┌────────────────────────────────────────────────────────┐
│                 Repository Data Layer                  │
└───────────────────────────┬────────────────────────────┘
▼
┌────────────────────────────────────────────────────────┐
│                   Prisma Engine ORM                    │
└────────────────────────────────────────────────────────┘
### Key Design Trade-offs
*   **Database Engine Precision:** Opted for PostgreSQL Explicit `Decimal(12, 2)` format over native Javascript Floating points primitives to securely neutralize rounding limits inside banking updates.
*   **Concurrency & ACID Strategy:** Encapsulated critical state switches inside localized database transactional boundaries (`prisma.$transaction`) ensuring multi-operation state transitions rollback cleanly on mid-flight connectivity failure events.

---

## 💾 Database Schema Structural Mappings

### 1. User Model
*   `id`: String (CUID Primitive) - Primary Key
*   `name`: String
*   `email`: String (Unique Index constraints)
*   `withdrawableBalance`: Decimal (Precision safety)
*   `lastWithdrawalAt`: DateTime (Nullable timestamp)

### 2. Sale Model
*   `id`: String (CUID Primary Key)
*   `userId`: String (Foreign Key relation boundary)
*   `brandId`: String (Foreign Key tracking entity)
*   `earning`: Decimal
*   `status`: Enum (PENDING, APPROVED, REJECTED)
*   `advancePaid`: Boolean Flag (Guarantees execution Idempotency)
*   `advanceAmount`: Decimal 

---

## 🔌 Core API Documentation Endpoints

### 1. Affiliate Sales Node
*   `POST /sales` - Registers an onboarding merchant pending sale entity.
*   `PATCH /sales/reconcile/:id` - Triggers admin verification pipeline execution logic.

### 2. Payout Management
*   `POST /payouts/advance` - Automated micro-batch utility calculating fraction advances.

### 3. Financial Withdrawal Hub
*   `POST /withdrawals` - Performs secure user ledger balance disbursement calls.
*   `PATCH /withdrawals/:id/status` - Recovery loop restoring balance metrics on pipeline blockages.

---

## 🛡️ Edge Cases & Exception Resiliency

1.  **Advance Payout Idempotency Loop:** Utilizes explicit state flags (`advancePaid`) to avoid duplicate payment extraction when scheduling workflows cycle multiple times over identically flagged objects[cite: 9].
2.  **24-Hour Velocity Cap:** Evaluates historical timestamps dynamically to protect liquid pools against double-click drain attacks[cite: 9].
3.  **Terminal Failure Rollback Workflow:** Listens for external payment cancellations, triggering reversal transactions that restore assets to liquid accounts immediately[cite: 9].