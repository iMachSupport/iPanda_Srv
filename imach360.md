# iMach360 Backend API Catalogue

Base URL: /api

**Architecture**

- **Backend Architecture:**
	- **Entry:** `server.js` — configures middleware, rate-limiting, CORS, DB connection and mounts route modules under `/api/*`.
	- **Routing modules:** files in `routes/` (e.g., `auth.js`, `leave.js`, `asset.js`, `hr.js`, `resource.js`, `expense.js`, `form.js`, `holiday.js`, `ticket.js`, `notification.js`, `files.js`) expose REST endpoints mounted under `/api/<resource>`.
	- **Middleware:** `middleware/auth.js`, `middleware/fileUpload.js`, `middleware/verifyMicrosoftToken.js` — handle JWT verification, role-based access, and file upload validation.
	- **Models:** Mongoose models in `models/` (User, Leave, Asset, ExpenseClaim, FormManagement, etc.) define schemas and relations.
	- **Services & utilities:** `services/` and `utils/` provide notification/email/file/storage/graph helpers (`notificationService.js`, `emailService.js`, `fileStorageService.js`, `graphService.js`, `requestEmailService.js`).
	- **Storage:** MongoDB (configured via `process.env.MONGO_URI`) for application data; files stored via Microsoft Graph / OneDrive (via `fileStorageService` + `graphService`).
	- **Auth & Integration:** JWT-based auth (`verifyToken`, `verifyRole`), Microsoft OAuth for SSO (`/api/auth/microsoft-login` and MSAL flow helpers). Password flows use bcrypt; password reset via email tokens.
	- **Operational concerns:** rate-limiting (express-rate-limit), security headers (helmet), compression, robust DB reconnect logic, health endpoint (`/health`). Server is designed to be serverless-friendly (connection pool tuning, short timeouts).

- **Frontend Architecture:**
	- **Framework:** React + Vite (source in `iMach360-Frontend/src`). Single-page application with route-based pages under `src/pages/` and shared `src/components/`.
	- **Auth & Access:** MSAL integration in `src/auth/` (e.g., `msalConfig.ts`, `Login.tsx`, `ProtectedRoute.tsx`) handles Microsoft SSO; app uses JWT for API calls after login.
	- **State & Context:** Context providers in `src/context/` and `src/auth/AuthContext.tsx` manage user/session state; `useSessionTimeout` and other hooks in `src/hooks/` provide common behaviors.
	- **Services:** API client and wrappers in `src/services/` (`api.ts`, `fileService.ts`, `msGraphService.ts`) centralize requests to backend `/api/*` endpoints and Graph integrations.
	- **Pages & Components:** Modular pages (LeaveManagement, ExpenseClaims, TicketManagement, etc.) call services and render UI via shared components (`Navbar.tsx`, `Sidebar.tsx`, `FileUploadBox.tsx`, etc.).
	- **File Uploads & Assets:** File uploads to backend endpoints under `/api/files` which proxy to OneDrive/Graph via backend `fileStorageService`.
	- **Dev & Deploy:** Local dev uses Vite dev server and `setupProxy.js` to forward API calls to backend; production builds are static assets served by nginx or Vercel (see `Dockerfile`, `nginx.conf`, `vercel.json`).

**Health**
- GET /health : Public. Service & DB health check.

**Auth** (/api/auth)
- POST /login : Body { email, password } — Returns JWT and user profile.
- POST /microsoft-login : Body { accessToken } — Microsoft OAuth; returns JWT and user.
- GET /microsoft-auth-url : Returns OAuth authorization URL for Microsoft.
- POST /forgot-password : Body { email } — Sends password reset email.
- POST /reset-password : Body { token, email, newPassword } — Resets password.
- GET /me : Auth required. Returns current user profile.
- POST /logout : Auth required. Clears refresh token.

Auth notes: Rate-limited (/api/auth/login, /api/auth/microsoft-login). Most endpoints use `verifyToken` middleware except public login/ms auth endpoints.

**Leaves** (/api/leaves)
- GET / : Auth. List leaves visible to caller (user/admin scoped).
- GET /user/:userId : Auth + role admin/manager. Leaves for specific user.
- GET /:id : Auth. Get single leave.
- POST / : Auth. Apply for leave. Body includes { leaveType, fromDate, toDate, reason, ... }.
- PUT /:id : Auth. Manager approves/rejects a leave. Body { status, remarks }.
- PUT /:id/attachments : Auth. Update attachments. Body { attachments }.
- DELETE /:id : Auth (admin or owner). Delete leave.

**Assets** (/api/assets)
- GET /asset-code : Auth. Returns next asset code.
- GET / : Auth. List all assets.
- GET /:id : Auth. Get asset by id.
- GET /user/:userId : Auth. Assets assigned to a user.
- POST / : Auth + role admin. Create asset.
- POST /:id/assign : Auth + role admin. Assign asset to user. Body { assignedTo, assignedUser }.
- POST /:id/initiate-return : Auth + role admin. Mark return requested.
- POST /:id/return : Auth. User acknowledges return.
- POST /:id/complete-return : Auth + role admin/manager. Finalize return.
- PUT /:id : Auth + role admin. Update asset.
- DELETE /:id : Auth + role admin. Delete asset.

**HR** (/api/hr)
- GET / : Auth + role admin/manager. List employees with HR details.
- GET /records : Auth + role admin. List HR records.
- GET /next-id : Auth. Returns next employee emp_id.
- GET /employee/:empId : Auth. Employee profile + HR details.
- GET /:id : Auth. Get single HR record.
- POST /create-user : Auth + role admin. Create new User (via admin/MS Graph).
- POST / : Auth + role admin. Create HR record.
- PUT /:id : Auth + role admin. Update HR record.
- PUT /user/:id : Auth + role admin. Update user details.
- PUT /user/:userId/manager : Auth + role admin. Assign manager.
- DELETE /:id : Auth + role admin. Delete employee and HR record.
- GET /users/all : Auth + role admin. List active users.

**Resources** (/api/resources)
- GET / : Auth + role admin/manager. List resources with filters (skills, availability, search, personType).
- GET /skills/all : Auth + role admin/manager. Unique skill list.
- GET /:id : Auth. Get resource by id.
- POST / : Auth + role admin. Create resource.
- PUT /:id : Auth + role admin. Update resource.
- POST /:id/projects : Auth + role admin. Add project to resource.
- PATCH /:id/availability : Auth + role admin. Update availability.
- DELETE /:id : Auth + role admin. Delete resource.

**Expenses** (/api/expenses)
- GET / : Auth. List expense claims visible to caller.
- GET /:id : Auth. Get single expense claim.
- POST / : Auth. Submit expense claim. Body { expenseType, amount, expenseDate, ... }.
- PUT /:id : Auth. Manager approves/rejects. Body { status, remarks }.
- PUT /:id/receipts : Auth. Update receipts. Body { receipts }.
- DELETE /:id : Auth (admin or owner). Delete claim.

**Forms** (/api/forms)
- GET /responses : Auth. Get all submitted form responses.
- GET /responses/:formName : Auth. Responses for a form name.
- POST /send-to-inbox : Auth. Send form notification to user inbox.
- POST /send-email : Auth. Send form via email.
- POST /submit-response : Auth. Submit a form response.
- GET / : Auth. List forms (user sees own + assigned).
- GET /:id : Auth. Get single form.
- POST / : Auth. Create form.
- PUT /:id : Auth. Update form.
- POST /:id/review : Auth + role admin. Approve/reject form.
- DELETE /:id : Auth. Delete form.

**Holidays** (/api/holidays)
- GET / : Auth. List holidays.
- GET /range/:from/:to : Auth. Holidays in timestamp range.
- POST / : Auth + role admin. Create holiday.
- PUT /:id : Auth + role admin. Update holiday.
- DELETE /:id : Auth + role admin. Delete holiday.

**Tickets** (/api/tickets)
- GET / : Auth. List tickets visible to caller.
- GET /:id : Auth. Get ticket details.
- POST / : Auth. Create ticket. Body { title, description, type, priority, assignedTo, attachments }.
- PUT /:id : Auth. Update status, resolution, add comment.
- DELETE /:id : Auth (admin or raiser). Delete ticket.

**Notifications** (/api/notifications)
- GET /pending-count : Auth. Count of pending items requiring action.
- GET /pending : Auth. Detailed list of pending notifications.

**Files** (/api/files)
- GET /profile-picture/:employeeNo : Public (redirects) — fetch profile picture proxy.
- POST /profile-picture : Auth. Upload profile picture. Body { fileData, fileName, employeeNo }.
- POST /identity-proof : Auth. Upload identity proof.
- POST /payslip : Auth. Upload payslip. Body { month }.
- POST /user-document : Auth. Upload user document.
- POST /leave-receipt : Auth. Upload leave receipt.
- POST /expense-receipt : Auth. Upload expense receipt.
- POST /asset-icon : Auth. Upload asset icon.
- POST /asset-image : Auth. Upload asset image.
- POST /asset-document : Auth. Upload asset document.
- POST /ticket-attachment : Auth. Upload ticket attachment.
- DELETE /:fileId : Auth. Delete file by fileId + driveId in body.

---

Notes & Next Steps:
- Authentication: Most routes require JWT via `Authorization: Bearer <token>` and `verifyToken` middleware. Role-based access uses `verifyRole([...])`.
- Error codes: Endpoints return JSON with `message` and `error` keys (e.g., `NOT_FOUND`, `INVALID_INPUT`, `FORBIDDEN`).

If desired, this catalogue can be extended with example requests/responses, parameter schemas, and a separate architecture diagram.