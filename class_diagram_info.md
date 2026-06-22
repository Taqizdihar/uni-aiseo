# UNI-AISEO — Backend Architecture & Class Diagram Information

This document provides a logical, Object-Oriented extraction of the UNI-AISEO Node.js backend. In an Express.js context, modules are mapped to **Classes**, and exported route handler functions are mapped to **Public Methods**.

---

## 1. List of Classes / Modules

The backend architecture consists of the following core logical components:

### Config & Utilities
1. **`DatabaseConfig`** (`config/db.js`)
2. **`AuditLogger`** (`utils/auditLogger.js`)

### Middlewares
3. **`AuthMiddleware`** (`middleware/authMiddleware.js`)
4. **`UploadMiddleware`** (`middleware/uploadMiddleware.js`)

### Controllers (Domain Logic)
5. **`AdminController`** (`controllers/adminController.js`)
6. **`ApprovalController`** (`controllers/approvalController.js`)
7. **`ArchiveController`** (`controllers/archiveController.js`)
8. **`AuthController`** (`controllers/authController.js`)
9. **`FaqController`** (`controllers/faqController.js`)
10. **`KeywordController`** (`controllers/keywordController.js`)
11. **`MetatagController`** (`controllers/metatagController.js`)
12. **`NotificationController`** (`controllers/notificationController.js`)
13. **`OnpageController`** (`controllers/onpageController.js`)
14. **`TaskController`** (`controllers/taskController.js`)
15. **`TeamController`** (`controllers/teamController.js`)
16. **`UserController`** (`controllers/userController.js`)
17. **`VisualController`** (`controllers/visualController.js`)
18. **`WorkspaceController`** (`controllers/workspaceController.js`)

---

## 2. Attributes & Methods

*(Note: In Express.js route handlers, `req` and `res` imply `Request` and `Response` objects. Most controllers return a `Promise<void>` as they handle the response asynchronously.)*

### 2.1 Config & Utilities

#### `DatabaseConfig`
- **Attributes:**
  - `+ pool: mysql.Pool` (Instantiated database connection pool)
- **Methods:**
  - *(Implicit execution of pool connection test on initialization)*

#### `AuditLogger`
- **Methods:**
  - `+ logAudit(userId: Number, actionDetail: String, ipAddress: String): Promise<void>`

---

### 2.2 Middlewares

#### `AuthMiddleware`
- **Attributes:**
  - `- jwt: jsonwebtoken`
- **Methods:**
  - `+ verifyToken(req: Request, res: Response, next: NextFunction): void`
  - `+ authorizeRoles(...allowedRoles: String[]): Function`

#### `UploadMiddleware`
- **Attributes:**
  - `- storage: multer.StorageEngine`
  - `+ upload: multer.Multer` (Exported multer instance)
- **Methods:**
  - `- fileFilter(req: Request, file: Object, cb: Function): void`

---

### 2.3 Controllers

#### `AdminController`
- **Methods:**
  - `+ getMetrics(req: Request, res: Response): Promise<void>`
  - `+ getUsers(req: Request, res: Response): Promise<void>`
  - `+ updateUserStatus(req: Request, res: Response): Promise<void>`
  - `+ deleteUser(req: Request, res: Response): Promise<void>`
  - `+ getWorkspaces(req: Request, res: Response): Promise<void>`
  - `+ updateWorkspaceStatus(req: Request, res: Response): Promise<void>`
  - `+ getAuditLogs(req: Request, res: Response): Promise<void>`

#### `ApprovalController`
- **Methods:**
  - `+ getPendingApprovals(req: Request, res: Response): Promise<void>`
  - `+ approveTask(req: Request, res: Response): Promise<void>`
  - `+ rejectTask(req: Request, res: Response): Promise<void>`

#### `ArchiveController`
- **Methods:**
  - `+ getArchive(req: Request, res: Response): Promise<void>`

#### `AuthController`
- **Attributes:**
  - `- SALT_ROUNDS: Number = 10`
- **Methods:**
  - `+ register(req: Request, res: Response): Promise<void>`
  - `+ login(req: Request, res: Response): Promise<void>`
  - `+ changePassword(req: Request, res: Response): Promise<void>`

#### `FaqController`
- **Methods:**
  - `+ getFaqs(req: Request, res: Response): Promise<void>`
  - `+ createFaq(req: Request, res: Response): Promise<void>`
  - `+ updateFaq(req: Request, res: Response): Promise<void>`
  - `+ deleteFaq(req: Request, res: Response): Promise<void>`

#### `KeywordController`
- **Attributes:**
  - `- genAI: GoogleGenerativeAI`
- **Methods:**
  - `+ generateKeywords(req: Request, res: Response): Promise<void>`
  - `+ saveKeywords(req: Request, res: Response): Promise<void>`

#### `MetatagController`
- **Attributes:**
  - `- genAI: GoogleGenerativeAI`
- **Methods:**
  - `+ generateMetaTags(req: Request, res: Response): Promise<void>`
  - `+ saveMetaTags(req: Request, res: Response): Promise<void>`

#### `NotificationController`
- **Methods:**
  - `+ getNotifications(req: Request, res: Response): Promise<void>`
  - `+ markAllAsRead(req: Request, res: Response): Promise<void>`

#### `OnpageController`
- **Attributes:**
  - `- genAI: GoogleGenerativeAI`
- **Methods:**
  - `+ getTaskData(req: Request, res: Response): Promise<void>`
  - `+ analyzeContent(req: Request, res: Response): Promise<void>`
  - `+ submitDraft(req: Request, res: Response): Promise<void>`

#### `TaskController`
- **Methods:**
  - `+ getTasks(req: Request, res: Response): Promise<void>`
  - `+ getActiveTasks(req: Request, res: Response): Promise<void>`
  - `+ getTaskDetails(req: Request, res: Response): Promise<void>`
  - `+ createTask(req: Request, res: Response): Promise<void>`
  - `+ updateTaskStatus(req: Request, res: Response): Promise<void>`
  - `+ deleteTask(req: Request, res: Response): Promise<void>`
  - `+ getArchive(req: Request, res: Response): Promise<void>`
  - `+ getDashboardMetrics(req: Request, res: Response): Promise<void>`

#### `TeamController`
- **Methods:**
  - `+ sendInvite(req: Request, res: Response): Promise<void>`

#### `UserController`
- **Methods:**
  - `+ getTeamMembers(req: Request, res: Response): Promise<void>`
  - `+ removeUser(req: Request, res: Response): Promise<void>`
  - `+ getProfile(req: Request, res: Response): Promise<void>`
  - `+ updateProfile(req: Request, res: Response): Promise<void>`

#### `VisualController`
- **Attributes:**
  - `- genAI: GoogleGenerativeAI`
- **Methods:**
  - `+ analyzeImage(req: Request, res: Response): Promise<void>`
  - `+ saveToTask(req: Request, res: Response): Promise<void>`
  - `+ getActiveTasks(req: Request, res: Response): Promise<void>`

#### `WorkspaceController`
- **Methods:**
  - `+ updateProfile(req: Request, res: Response): Promise<void>`

---

## 3. Relationships & Dependencies

### 3.1 Database Dependencies (Global)
- **Dependency:** **`All Controllers`** depend on **`DatabaseConfig`**. Every controller imports `pool` from `config/db.js` to execute queries (e.g., `pool.query(...)` or `pool.execute(...)`).
- **Dependency:** **`AuditLogger`** depends on **`DatabaseConfig`** to write to the `audit_logs` table.

### 3.2 Service/Utility Associations
- **Association:** **`AuthController`** uses **`AuditLogger`** to log successful logins.
- **Association:** **`TaskController`** uses **`AuditLogger`** to log when a new task is created.
- **Association:** **`KeywordController`** uses **`AuditLogger`** to log when a user generates AI keywords.

### 3.3 Middleware Interactions
- **Association:** Express Routes (conceptually tying the app together) use **`AuthMiddleware`** to guard controller methods. The `verifyToken` method attaches a decoded user payload (`req.user`) that the controllers rely on for context (like `req.user.workspace_id`).
- **Association:** Express Routes use **`UploadMiddleware`** before passing execution to **`VisualController.analyzeImage`**, **`UserController.updateProfile`**, and **`WorkspaceController.updateProfile`** (attaching the file to `req.file`).

### 3.4 AI Library Dependencies
- **Dependency:** **`KeywordController`**, **`MetatagController`**, **`OnpageController`**, and **`VisualController`** depend on the `@google/generative-ai` library. Each instantiates a `GoogleGenerativeAI` object (using `process.env.GEMINI_API_KEY`) to perform AI analysis features (text generation, multimodal image analysis).

### 3.5 Security Libraries
- **Dependency:** **`AuthController`** depends on `bcrypt` for password hashing and `jsonwebtoken` for token signing.
- **Dependency:** **`AuthMiddleware`** depends on `jsonwebtoken` for token verification.

### 3.6 Data Flow & Trigger Associations (Implicit via Database)
- While not direct class method calls, some controllers trigger data that affects others via the database:
  - **`TaskController.createTask`** creates `notifications`.
  - **`OnpageController.submitDraft`** creates `notifications` for the SEO Manager.
  - **`ApprovalController.approveTask` / `rejectTask`** create `notifications` and modify task states managed by `TaskController`.
