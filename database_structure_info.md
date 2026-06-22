# UNI-AISEO — Complete Database Structure

> [!NOTE]
> This document was reverse-engineered from the source code of the UNI-AISEO backend (Node.js + MySQL via `mysql2/promise`).
> Sources analyzed: `config/schema.sql`, migration scripts (`create_tasks_table.js`, `createFaqTable.js`, `alter_tables.js`, `setupAdminSchema.js`, `migrate_invite_columns.js`), all 14 controllers, and the `auditLogger.js` utility.
>
> **Database**: `uni-aiseo_db` — **Engine**: MySQL (InnoDB) — **Charset**: `utf8mb4` / `utf8mb4_unicode_ci`

---

## 1. List of Entities (Tables)

| # | Table Name | Domain | Source of Definition |
|---|---|---|---|
| 1 | `workspaces` | Core / Multi-Tenancy | `config/schema.sql` + `setupAdminSchema.js` + `alter_tables.js` |
| 2 | `users` | Core / RBAC / Authentication | `config/schema.sql` + `alter_tables.js` + `setupAdminSchema.js` + `migrate_invite_columns.js` |
| 3 | `tasks` | Project / Kanban Workflow | `create_tasks_table.js` + `approvalController.js` (rejection_note) |
| 4 | `task_keywords` | AI Analytical Data (SEO) | Inferred from `keywordController.js` |
| 5 | `task_contents` | AI Analytical Data (On-Page SEO) | Inferred from `onpageController.js` |
| 6 | `task_metatags` | AI Analytical Data (SEO Meta) | Inferred from `metatagController.js` |
| 7 | `task_visuals` | AI Analytical Data (Visual/UX Audit) | Inferred from `visualController.js` |
| 8 | `notifications` | System Notifications | Inferred from `notificationController.js`, `taskController.js`, `approvalController.js`, `onpageController.js` |
| 9 | `audit_logs` | Admin / Audit Trail | `setupAdminSchema.js` + `auditLogger.js` |
| 10 | `faqs` | Public Content / FAQ | `createFaqTable.js` |

---

## 2. Attributes & Data Types

### 2.1 `workspaces`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | Workspace display name |
| `background_image` | VARCHAR(255) | DEFAULT NULL | URL path to background image (added via `alter_tables.js`) |
| `api_credits_used` | INT | DEFAULT 0 | Tracks AI API credit consumption (added via `setupAdminSchema.js`) |
| `status` | ENUM('Aktif', 'Ditangguhkan') | DEFAULT 'Aktif' | Workspace activation status (added via `setupAdminSchema.js`) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 2.2 `users`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `workspace_id` | INT | NOT NULL, **FK** → `workspaces(id)` ON DELETE CASCADE | Multi-tenancy scoping |
| `name` | VARCHAR(255) | DEFAULT NULL | Nullable for pending invited users (modified via `migrate_invite_columns.js`) |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier |
| `password` | VARCHAR(255) | DEFAULT NULL | Nullable for pending invited users (modified via `migrate_invite_columns.js`). Set to `'PENDING_USER_NO_LOGIN'` for pre-registered invites. |
| `role` | ENUM('SEO Manager', 'SEO Analyst', 'Content Writer', 'Admin') | NOT NULL, DEFAULT 'SEO Manager' | RBAC role assignment |
| `status` | ENUM('Aktif', 'Ditangguhkan', 'Tertunda') | DEFAULT 'Aktif' | User account status. 'Tertunda' = pending invitation (modified via `migrate_invite_columns.js`) |
| `profile_picture` | VARCHAR(255) | DEFAULT NULL | URL path to profile image (added via `alter_tables.js`) |
| `invite_token` | VARCHAR(255) | DEFAULT NULL | Token for email-based invitation (added via `migrate_invite_columns.js`) |
| `token_expires` | DATETIME | DEFAULT NULL | Expiration timestamp for invite token (added via `migrate_invite_columns.js`) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**ENUM Breakdown — `role`:**
| Value | Description |
|---|---|
| `'SEO Manager'` | Workspace owner; creates tasks, manages team, approves content |
| `'SEO Analyst'` | Performs keyword research & visual analysis; moves tasks To Do → In Progress |
| `'Content Writer'` | Writes content drafts; submits for approval |
| `'Admin'` | System-wide administrator; manages all workspaces and users |

**ENUM Breakdown — `status`:**
| Value | Description |
|---|---|
| `'Aktif'` | Active, can log in |
| `'Ditangguhkan'` | Suspended by admin |
| `'Tertunda'` | Pending; pre-registered via team invite, awaiting registration claim |

---

### 2.3 `tasks`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `workspace_id` | INT | NOT NULL, **FK** → `workspaces(id)` ON DELETE CASCADE | Workspace scoping |
| `title` | VARCHAR(255) | NOT NULL | Task/campaign name |
| `description` | TEXT | | Optional task description |
| `status` | ENUM('To Do', 'In Progress', 'Waiting Approval', 'Done') | NOT NULL, DEFAULT 'To Do' | Kanban board workflow status. Note: original migration had `'In Review'`; code uses `'Waiting Approval'` as the actual operational value. |
| `analyst_id` | INT | **FK** → `users(id)` ON DELETE SET NULL | Assigned SEO Analyst |
| `writer_id` | INT | **FK** → `users(id)` ON DELETE SET NULL | Assigned Content Writer |
| `rejection_note` | TEXT | DEFAULT NULL | Manager's rejection feedback (inferred from `approvalController.js`; set on reject, cleared on approve) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**ENUM Breakdown — `status`:**
| Value | Description |
|---|---|
| `'To Do'` | Newly created, not yet started |
| `'In Progress'` | Analyst has started working / Writer revising after rejection |
| `'Waiting Approval'` | Content Writer submitted draft; awaiting Manager review |
| `'Done'` | Manager approved; task archived |

---

### 2.4 `task_keywords`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `task_id` | INT | **FK** → `tasks(id)` | Links keyword to its parent task |
| `keyword` | VARCHAR(255) | | The SEO keyword string |
| `volume` | INT | DEFAULT 0 | Estimated monthly search volume |
| `kd_percent` | INT | DEFAULT 0 | Keyword Difficulty percentage (0–100) |
| `intent` | VARCHAR(50) | DEFAULT 'Informational' | Search intent classification |

**Operational Values for `intent`:**
| Value | Description |
|---|---|
| `'Informational'` | User is seeking information |
| `'Commercial'` | User is comparing products/services |
| `'Transactional'` | User intends to take action (buy, sign up) |
| `'Navigational'` | User is looking for a specific website/page |

> [!NOTE]
> The `intent` column is stored as VARCHAR, not ENUM. The allowed values are enforced by the AI prompt and application logic, not a database constraint.

---

### 2.5 `task_contents`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `task_id` | INT | **FK** → `tasks(id)`, UNIQUE (implied by upsert logic) | One content record per task |
| `content_draft` | TEXT / LONGTEXT | | The content writer's article/blog draft |
| `focus_keyword` | VARCHAR(255) | DEFAULT NULL | Primary keyword targeted by the content |
| `seo_score` | INT | DEFAULT NULL | AI-generated SEO quality score (0–100) |
| `readability_level` | VARCHAR(100) | DEFAULT NULL | AI-generated readability assessment (e.g., 'Mudah Dipahami', 'Cukup Baik') |

> [!IMPORTANT]
> The controller uses INSERT/UPDATE upsert logic (checks `SELECT id FROM task_contents WHERE task_id = ?`), implying `task_id` has a unique constraint or the application enforces a one-to-one relationship.

---

### 2.6 `task_metatags`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `task_id` | INT | **FK** → `tasks(id)`, UNIQUE | One metatag record per task |
| `meta_title` | VARCHAR(255) | | SEO meta title (50–60 chars recommended) |
| `meta_description` | TEXT | | SEO meta description (150–160 chars recommended) |

> [!NOTE]
> Uses `ON DUPLICATE KEY UPDATE` in `metatagController.js`, confirming `task_id` has a UNIQUE index/constraint.

---

### 2.7 `task_visuals`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `task_id` | INT | **FK** → `tasks(id)` | One visual analysis record per task |
| `image_url` | VARCHAR(255) | | Path to the uploaded screenshot/image |
| `text_ratio` | VARCHAR(255) | | AI assessment of text-to-image ratio (e.g., '18% (Optimal)') |
| `readability` | VARCHAR(255) | | AI readability score (e.g., '92/100 (Sangat Baik)') |
| `contrast_score` | VARCHAR(255) | | AI color contrast/WCAG assessment |
| `recommendations` | TEXT / JSON | | JSON-stringified array of actionable UX/SEO recommendations |

---

### 2.8 `notifications`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `workspace_id` | INT | **FK** → `workspaces(id)` | Scoped to workspace |
| `user_id` | INT | **FK** → `users(id)` | Target recipient user |
| `message` | VARCHAR(255) | NOT NULL | Notification text content |
| `is_read` | BOOLEAN / TINYINT(1) | DEFAULT FALSE | Read status flag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

> [!NOTE]
> No explicit CREATE TABLE statement was found in the codebase. Structure is inferred from INSERT and SELECT queries across `taskController.js`, `onpageController.js`, `approvalController.js`, and `notificationController.js`.

---

### 2.9 `audit_logs`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `user_id` | INT | **FK** → `users(id)` ON DELETE SET NULL | The user who performed the action |
| `action_detail` | VARCHAR(255) | NOT NULL | Description of the audited action (e.g., 'Log Masuk (Login)', 'Membuat Tugas Baru: ...', 'Generate AI Keyword: ...') |
| `ip_address` | VARCHAR(45) | | Client IP address (supports IPv6 length) |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the action occurred |

> [!WARNING]
> The original `setupAdminSchema.js` creates this table with columns `action`, `ip_address`, and `created_at`. However, the operational code (`auditLogger.js`, `adminController.js`, `notificationController.js`) consistently uses `action_detail` and `timestamp` as column names. This indicates the schema was ALTER-ed after initial creation. The column names listed above reflect the **actual runtime schema** used by the application.

---

### 2.10 `faqs`

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | **PK**, AUTO_INCREMENT | |
| `question` | TEXT | NOT NULL | FAQ question text |
| `answer` | TEXT | NOT NULL | FAQ answer text |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

> [!NOTE]
> The `faqs` table is a standalone, global table — not scoped to any workspace. It is managed exclusively by Admin role users.

---

## 3. Relationships & Cardinality

### 3.1 Relationship Map

| # | Parent Entity | Child Entity | Relationship Type | FK Column (in Child) | ON DELETE | Description |
|---|---|---|---|---|---|---|
| R1 | `workspaces` | `users` | **One-to-Many** | `users.workspace_id` | CASCADE | A Workspace has many Users. Deleting a workspace cascades to all its members. |
| R2 | `workspaces` | `tasks` | **One-to-Many** | `tasks.workspace_id` | CASCADE | A Workspace has many Tasks. Deleting a workspace cascades to all its tasks. |
| R3 | `workspaces` | `notifications` | **One-to-Many** | `notifications.workspace_id` | (implied CASCADE) | A Workspace has many Notifications scoped to its team. |
| R4 | `users` | `tasks` (as analyst) | **One-to-Many** | `tasks.analyst_id` | SET NULL | A User (SEO Analyst) can be assigned to many Tasks as the analyst. If the user is deleted, the assignment is nullified. |
| R5 | `users` | `tasks` (as writer) | **One-to-Many** | `tasks.writer_id` | SET NULL | A User (Content Writer) can be assigned to many Tasks as the writer. If the user is deleted, the assignment is nullified. |
| R6 | `users` | `notifications` | **One-to-Many** | `notifications.user_id` | (implied) | A User receives many Notifications. |
| R7 | `users` | `audit_logs` | **One-to-Many** | `audit_logs.user_id` | SET NULL | A User generates many Audit Log entries. If the user is deleted, the log entry's user reference is nullified. |
| R8 | `tasks` | `task_keywords` | **One-to-Many** | `task_keywords.task_id` | (implied CASCADE) | A Task has many Keywords (5–7 generated per AI call, multiple calls possible). |
| R9 | `tasks` | `task_contents` | **One-to-One** | `task_contents.task_id` | (implied CASCADE) | A Task has exactly one Content Draft record (enforced by upsert logic). |
| R10 | `tasks` | `task_metatags` | **One-to-One** | `task_metatags.task_id` | (implied CASCADE) | A Task has exactly one MetaTags record (enforced by `ON DUPLICATE KEY UPDATE`). |
| R11 | `tasks` | `task_visuals` | **One-to-One** | `task_visuals.task_id` | (implied CASCADE) | A Task has exactly one Visual Analysis record (enforced by upsert logic). |

---

### 3.2 Detailed Relationship Explanations

#### R1: Workspaces → Users (One-to-Many)
A **Workspace** is the top-level multi-tenant container. When an SEO Manager registers, a new Workspace is created and the manager is automatically linked to it. All team members (SEO Analysts, Content Writers) invited by the Manager are added to the same workspace via `workspace_id`. The `ON DELETE CASCADE` ensures that if a workspace is removed, all associated user accounts are deleted.

#### R2: Workspaces → Tasks (One-to-Many)
Each **Task** (representing an SEO campaign) belongs to exactly one Workspace. The SEO Manager creates tasks within their workspace, and all workspace members collaborate on these tasks. The workspace scoping is enforced in every controller query via `WHERE workspace_id = ?`.

#### R3: Workspaces → Notifications (One-to-Many)
**Notifications** are scoped at the workspace level. They are created system-wide when certain events occur (task creation, draft submission, approval/rejection). The `workspace_id` allows filtering all notifications for a given workspace.

#### R4 & R5: Users → Tasks (One-to-Many, dual-role assignment)
Each Task can have two user assignments:
- **`analyst_id`** — The SEO Analyst responsible for keyword research and visual analysis.
- **`writer_id`** — The Content Writer responsible for drafting the article/content.

Both are nullable (`ON DELETE SET NULL`), meaning a task can exist without assigned members, and deleting a user doesn't delete their tasks.

#### R6: Users → Notifications (One-to-Many)
Each Notification targets a specific `user_id` as its recipient. When a task is created, the assigned analyst and writer each receive a notification. When a draft is submitted, the SEO Manager receives a notification. When a task is approved/rejected, the writer (and analyst) receive notifications.

#### R7: Users → Audit Logs (One-to-Many)
Every significant user action (login, task creation, keyword generation) is logged to `audit_logs` with the acting `user_id`. The Admin dashboard can query these logs with search/filter capabilities. `ON DELETE SET NULL` preserves audit history even if a user is deleted.

#### R8: Tasks → Task Keywords (One-to-Many)
A single Task can have multiple keywords stored via the AI keyword generation feature. The SEO Analyst generates 5–7 keywords per session using Gemini 2.5 Flash, and selected keywords are bulk-inserted into `task_keywords`. The first keyword is treated as the "Focus Keyword" by the on-page analysis module.

#### R9: Tasks → Task Contents (One-to-One)
Each Task has at most one content draft. The Content Writer writes the draft, runs AI-powered on-page SEO analysis (generating `seo_score` and `readability_level`), and submits it for approval. The controller uses explicit upsert logic to enforce the one-to-one constraint.

#### R10: Tasks → Task MetaTags (One-to-One)
Each Task has at most one set of meta tags (title + description). Generated by Gemini 2.5 Flash and saved using `ON DUPLICATE KEY UPDATE`, confirming the `task_id` uniqueness constraint at the database level.

#### R11: Tasks → Task Visuals (One-to-One)
Each Task has at most one visual analysis record. The SEO Analyst uploads a website screenshot, which is analyzed by Gemini 2.5 Flash for text ratio, readability, contrast, and UX recommendations. The controller uses upsert logic to enforce one-to-one.

---

### 3.3 Standalone Tables (No Foreign Key Relationships)

| Table | Reason |
|---|---|
| `faqs` | Global FAQ content managed by Admin; not tied to any workspace, user, or task. |

---

## 4. Summary: Entity-Relationship Overview

```
workspaces (1) ──────┬──── (N) users
                     │              │
                     │              ├── (N) tasks.analyst_id
                     │              ├── (N) tasks.writer_id
                     │              ├── (N) notifications.user_id
                     │              └── (N) audit_logs.user_id
                     │
                     ├──── (N) tasks
                     │         │
                     │         ├── (N) task_keywords
                     │         ├── (1) task_contents
                     │         ├── (1) task_metatags
                     │         └── (1) task_visuals
                     │
                     └──── (N) notifications

faqs (standalone, global)
audit_logs (standalone, references users)
```

---

## 5. Technical Notes & Discrepancies

> [!WARNING]
> **Schema vs. Runtime Discrepancies Detected**

1. **`tasks.status` ENUM**: The `create_tasks_table.js` migration defines the ENUM as `('To Do', 'In Progress', 'In Review', 'Done')`, but the application code universally uses `'Waiting Approval'` instead of `'In Review'`. This indicates the column was ALTER-ed post-creation. The **operational values** are: `'To Do'`, `'In Progress'`, `'Waiting Approval'`, `'Done'`.

2. **`audit_logs` Column Names**: The `setupAdminSchema.js` creates columns named `action`, `ip_address`, and `created_at`. However, all runtime code (`auditLogger.js`, `adminController.js`) references `action_detail` and `timestamp`. This means the table was ALTER-ed after initial creation. The **actual column names** are: `action_detail` and `timestamp`.

3. **`users.status` ENUM Evolution**: The initial `schema.sql` defines `('Aktif', 'Nonaktif')`, then `setupAdminSchema.js` modifies it to `('Aktif', 'Ditangguhkan')`, and finally `migrate_invite_columns.js` extends it to `('Aktif', 'Ditangguhkan', 'Tertunda')`. The **final operational values** are the three-value set.

4. **Implicit Table Definitions**: Four tables (`task_keywords`, `task_contents`, `task_metatags`, `task_visuals`, `notifications`) have no explicit CREATE TABLE statements in the codebase. Their schemas are reconstructed from INSERT/SELECT/UPDATE queries. These tables were likely created manually via SQL client or through migration scripts that are not version-controlled.

5. **`task_contents.content_draft` Data Type**: Likely `LONGTEXT` or `MEDIUMTEXT` rather than standard `TEXT`, as it stores full article drafts that can be substantial in length.
