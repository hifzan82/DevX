# AGENTS.md — Web Accessibility Auditor (PS 11)

> **Purpose:** Instructions and shared technical context for AI coding agents (including OpenCode) working in this repository.
>
> **Important:** This document describes the intended architecture and product behavior. It does **not** prove that any feature, endpoint, table, dependency, or directory already exists. Always inspect the current repository before implementing changes, and adapt these recommendations to the actual codebase.

## 1. Project Overview

Build a web accessibility auditing platform that scans websites, explains accessibility findings, suggests fixes, previews affected elements, verifies proposed changes, and helps teams track accessibility regressions over time.

### Core product experience

The main experience is a single audit workspace:

- A horizontal top navigation bar with the product identity and secondary tools.
- A URL submission form and scan controls near the top.
- Compact summary statistics for the current scan.
- A **left panel** containing detected accessibility issues and suggested fixes.
- A **right panel** showing the website preview, with the selected issue highlighted where technically supported.
- Actions for previewing and verifying fixes, exporting reports, comparing scans, crawling multiple pages, monitoring sites, and preparing reviewed GitHub pull requests.

Selecting an issue in the left panel should synchronize with the preview: identify the relevant element, scroll to it when possible, visually mark it, and show the selected rule and severity. Do not claim that highlighting or verification works when only mock data is available.

## 2. Required Agent Behavior

Before making changes:

1. Read this file and any other applicable `AGENTS.md` files in directories being changed.
2. Inspect the repository tree, `package.json` files, lockfiles, environment examples, existing routes, database setup, and tests.
3. Determine which features already work and which are missing. Do not recreate existing components or services unnecessarily.
4. Identify the smallest reasonable set of changes for the requested task.
5. Follow the project's existing conventions where they do not conflict with the requirements in this file.

While working:

- Implement the requested changes in code; do not stop after writing a plan.
- Keep changes focused and modular. Avoid unrelated refactors and unnecessary dependencies.
- Do not replace an existing framework or language without an explicit request.
- Do not assume that proposed API endpoints below already exist. Inspect backend routes and adapt the frontend to the actual contract.
- Do not fabricate successful API responses, scan results, GitHub connections, scan progress, or verification results.
- Sample/demo data is acceptable for an explicit demo state, but label it clearly and keep it separate from production API behavior.
- Do not delete working code, user data, migrations, configuration, or dependencies without a clear reason.
- Never expose credentials, private tokens, database passwords, or AI-provider keys in frontend code or committed files.
- Do not modify areas explicitly excluded by the current user task. For example, a frontend-only task must not change backend or infrastructure files.
- If a requested feature depends on a missing backend capability, implement the frontend integration boundary and clearly report what backend work remains.

Before finishing:

1. Run relevant lint, test, type-check, and/or build commands that are available in the repository.
2. Fix errors introduced by your changes.
3. Review the final diff for accidental changes, hardcoded secrets, debug output, and broken paths.
4. Summarize what changed, commands run, test/build results, and remaining limitations.
5. Never claim that a command or test passed unless it was actually run and succeeded.

## 3. Intended Technology Stack

Preserve the current stack if it already exists. The intended stack is:

### Frontend

- React
- Vite
- JavaScript/JSX (do not introduce TypeScript unless the project already uses it or the user requests it)
- Tailwind CSS
- Lucide React for icons
- Axios for HTTP requests
- React Hooks for local and shared UI state

### Backend

- Node.js
- Express.js
- JavaScript ES modules if already configured (`"type": "module"`)
- MySQL as the persistent relational database
- Redis and BullMQ for background jobs and scheduling
- Puppeteer and Chromium for browser automation
- axe-core for automated accessibility checks
- A server-side AI provider integration (choose according to the existing code/configuration; do not hardcode provider assumptions)
- GitHub App/API integration for reviewed patch and pull-request creation

### Deployment target

- Docker containers for the API and worker
- Redis and MySQL reachable only over private/internal networking
- Nginx and HTTPS when self-hosted behind a public domain
- AWS EC2 is a suitable initial host; managed MySQL such as RDS and managed Redis are preferable for production where practical
- S3 or equivalent object storage may be used for screenshots and large report artifacts

Do not add a framework or service merely because it appears in this list. Inspect the existing code and add only what the implementation requires.

## 4. High-Level System Architecture

```text
Browser
  |
  v
React + Vite frontend
  |
  | HTTPS / REST API (optional WebSocket/SSE progress updates)
  v
Express API
  |                         \
  | write/read               \ enqueue job
  v                           v
MySQL                    Redis + BullMQ
                                |
                                v
                        Separate Node.js worker
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
               Puppeteer + axe-core     AI provider API
                    |
                    v
             Scan/page/DOM results
                    |
                    v
                   MySQL
```

### Responsibilities

- **React:** UI rendering, user interaction, API requests, polling/subscription to job progress, filters, issue selection, preview overlays, and report downloads.
- **Express API:** request validation, access control, URL safety checks, database operations, enqueueing work, returning scan status/results, and initiating approved integrations.
- **MySQL:** durable application data, scan snapshots, findings, user decisions, monitoring configuration, remediation tasks, and GitHub PR metadata.
- **Redis/BullMQ:** background job queues, retry/backoff handling, scheduled jobs, and transient progress/job state.
- **Worker:** browser launch, page navigation/crawling, axe-core analysis, preview metadata/screenshot capture, AI suggestions, report creation, and durable result persistence.
- **AI provider:** explanations and candidate fixes only. The AI output is untrusted and must be validated before use.
- **GitHub integration:** retrieve repository/source context, create a proposed patch in a branch after user approval, and open a pull request. Never silently merge changes or update production code.

Keep the Express API and worker as separate processes/containers, even if they share a backend package and codebase. Long-running browser scans must not run inside normal request handlers.

## 5. Suggested Repository Structure

Treat this as guidance, not a mandate. Adapt to the existing repository rather than restructuring everything without need.

```text
repository-root/
├── AGENTS.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── scan/
│   │   │   ├── dashboard/
│   │   │   ├── issues/
│   │   │   ├── preview/
│   │   │   ├── crawl/
│   │   │   ├── monitoring/
│   │   │   ├── github/
│   │   │   └── reports/
│   │   ├── pages/
│   │   │   └── AuditDashboard.jsx
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── queues/
│   │   ├── workers/
│   │   └── app.js
│   ├── migrations/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── docs/
```

Do not create empty folders solely to match this drawing. Add files when needed by real functionality.

## 6. Main UI Requirements

### 6.1 General layout

- Light theme by default: white/near-white surfaces, gray borders, blue primary actions, readable contrast, restrained shadows.
- Optional dark theme with near-black surfaces.
- Responsive layout with two panels side by side on desktop and tabs/stacked panels on narrow screens.
- Avoid unnecessary page navigation for the main auditing workflow.
- Support loading, empty, error, queued, processing, completed, and failed states.
- Every visible button must do its advertised action or be clearly disabled with a reason.

### 6.2 Top area

Include:

- Product logo/name (working title: AccessLens; change only if project branding says otherwise).
- URL input.
- `Scan Website` action.
- `Scan All Pages` action.
- Scan progress/status and rescan action where appropriate.
- Secondary navigation for history, monitoring, GitHub, reports, documentation, and settings when those features exist.

### 6.3 Summary cards

Summaries may include:

- Accessibility score, if a documented scoring algorithm exists.
- Total violation occurrences.
- Counts by severity.
- Verified fixes versus issues in scope.

Do not describe a score as an official or definitive WCAG compliance rating. axe-core findings do not prove that a site is fully accessible; some checks require human assessment. If a custom 0–100 score is shown, document the algorithm and label it as a project-defined estimate.

### 6.4 Left panel: issue list

Each issue should display the available fields:

- Rule/issue title and axe-core rule ID.
- Impact/severity.
- WCAG tags/criterion when provided by axe-core.
- Affected page URL.
- Affected target selector(s) and HTML snippet when safe and useful.
- Plain-language explanation.
- Suggested fix and verification status.
- Actions to inspect, preview, copy, verify, ignore, or restore.

Provide search and filters by severity, WCAG tag, page, and state. Do not delete scan evidence when an issue is ignored.

### 6.5 Right panel: website preview and highlighting

When an issue is selected, the frontend should use the corresponding selector/preview metadata to locate and highlight the affected element where supported.

**Browser security constraint:** A parent page cannot freely inspect or modify the DOM of an arbitrary cross-origin iframe. Do not try to bypass same-origin policy, CSP, or other site protections. Do not use an unrestricted proxy to render arbitrary sites.

Use a suitable, honest preview strategy:

1. A controlled same-origin preview document for HTML that the user supplies or a corrected snippet.
2. A permitted iframe when the target allows embedding, without assuming DOM access.
3. A backend-controlled Puppeteer capture that returns a screenshot plus element bounding boxes/selectors for visual overlays when direct DOM synchronization is unavailable.

Clearly label screenshot/overlay mode if the preview is not a live, interactive page. Handle stale selectors, dynamic layouts, viewport changes, and missing elements gracefully. Use a safe, isolated environment for user-supplied HTML and proposed fixes.

## 7. Scan Lifecycle and Background Processing

Suggested scan states:

```text
queued -> processing -> completed
                    \-> failed
queued/processing -> cancelled (only if cancellation is implemented)
```

Suggested worker pipeline:

1. Receive a scan/run ID and validated URL from the queue.
2. Mark the run as processing.
3. Launch Chromium with safe browser settings and resource limits.
4. Navigate with timeouts; do not wait indefinitely for `networkidle` on sites with persistent connections.
5. Inject/run axe-core and collect violations, relevant node targets, rule metadata, and result status.
6. Capture screenshots/element positions if the active preview strategy needs them.
7. Reduce and sanitize the context sent to the AI provider; do not send an entire page or unrelated personal data by default.
8. Generate structured suggestions, validate their schema, and store them as unverified proposals.
9. Persist scan/page/finding data transactionally where appropriate.
10. Mark the job and run completed, update useful progress metadata, and release browser resources in `finally` blocks.

Use bounded concurrency. Make job processing idempotent where possible. Retry transient failures with exponential backoff, but do not endlessly retry invalid URLs or deterministic failures. Close pages/browsers and release resources on every failure path.

## 8. Proposed API Contracts

These endpoints are intended contracts only. First inspect the existing API and preserve any established route shape. If route contracts differ, either use the existing contract or make a deliberate, documented migration.

| Method | Proposed endpoint | Purpose |
|---|---|---|
| `POST` | `/api/scans` | Validate URL, create a scan run, enqueue a job, return the scan/run ID |
| `GET` | `/api/scans/:scanId` | Return scan status, progress, errors, and summary |
| `GET` | `/api/scans/:scanId/issues` | Return paginated/filterable findings |
| `POST` | `/api/scans/:scanId/rescan` | Create a new scan snapshot for the same target |
| `POST` | `/api/crawls` | Start a bounded multi-page crawl |
| `GET` | `/api/crawls/:crawlId` | Return crawl progress and summary |
| `GET` | `/api/crawls/:crawlId/pages` | Return page-level results |
| `POST` | `/api/fixes/:fixId/generate` | Generate/create a suggested fix, if generation is a separate step |
| `POST` | `/api/fixes/:fixId/verify` | Verify a proposed fix in an isolated environment |
| `PATCH` | `/api/issues/:issueId/decision` | Record ignore/restore/user decision without deleting scan evidence |
| `GET` | `/api/scans/:scanId/compare?baselineId=...` | Compare two scan snapshots |
| `GET` | `/api/roadmap/:scanId` | Return a prioritized remediation plan |
| `POST` | `/api/monitors` | Create a recurring scan schedule |
| `GET` | `/api/monitors` | List configured monitors |
| `PATCH` | `/api/monitors/:monitorId` | Pause, resume, or update schedule |
| `DELETE` | `/api/monitors/:monitorId` | Remove a monitor and its schedule |
| `GET` | `/api/scans/:scanId/report` | Generate/download PDF or CSV report |
| `GET` | `/api/github/repos` | List repositories available to an authorized installation/user |
| `POST` | `/api/github/pull-requests` | Create a pull request from explicitly approved patches |

Example scan submission response:

```json
{
  "scanId": "<uuid-or-project-id>",
  "jobId": "<bullmq-job-id>",
  "status": "queued"
}
```

Example status response:

```json
{
  "scanId": "<uuid-or-project-id>",
  "status": "processing",
  "stage": "accessibility-analysis",
  "progress": {
    "completedPages": 1,
    "totalPages": 1
  }
}
```

Keep response shapes consistent. Validate and normalize every incoming field; return clear errors with appropriate HTTP status codes. Do not leak stack traces or secrets to clients.

## 9. Database Design (MySQL)

The database is the source of truth for durable product data. Redis is not a replacement for persistent scan history.

Potential tables/entities (adapt to the current schema and normalize to match actual usage):

- `users`: account ID, email, password hash or external-auth identity, timestamps.
- `sites`: owner ID, normalized base URL, display name, timestamps.
- `scan_runs`: scan ID, site ID, trigger type, status, score if defined, timestamps, error summary, configuration.
- `crawl_runs`: crawl ID, site ID, status, crawl limits, progress, timestamps.
- `scan_pages`: scan/crawl association, page URL, status, page score if defined, screenshot/artifact reference, timestamps.
- `violations`: page/run association, rule ID, impact, WCAG tags, target selectors, safe HTML snippet, help text, fingerprint, raw metadata when needed.
- `fix_proposals`: violation association, proposed patch/code, explanation, generation provider/model metadata, review state, verification state.
- `issue_decisions`: user/owner, fingerprint or finding association, ignored/accepted decision, reason, timestamps. Do not overwrite/delete historical scan findings.
- `remediation_tasks`: scan/site association, task, priority inputs, effort estimate, status, completion data.
- `monitors`: site ID, frequency/time zone if needed, active state, next-run metadata, configuration.
- `notifications`: owner ID, type, payload, read state, timestamps.
- `github_connections`: owner ID, GitHub App installation ID, permitted repo mapping, encrypted credential references only when required.
- `pull_requests`: repository identity, branch, PR URL, source patch IDs, status, timestamps.

Database rules:

- Use migrations for schema changes.
- Use primary/foreign keys and indexes for common lookups.
- Store flexible rule payloads in JSON only where useful; do not put the entire database into one JSON blob.
- Store timestamps consistently (normally UTC) and display them in the user's locale.
- Use parameterized queries or the existing ORM/query builder.
- Do not store plaintext passwords, GitHub tokens, or API keys.
- Keep scan snapshots immutable where possible so comparisons remain trustworthy.
- Use stable violation fingerprints for comparisons; a fingerprint can consider rule ID, normalized page URL, and a normalized target selector, with a fallback for dynamic selectors.

## 10. Redis and BullMQ

Use Redis/BullMQ for async execution and schedules, not as the permanent system of record.

Potential queues:

- `scan-queue`: single-page scans and retries.
- `crawl-queue`: crawl orchestration/page scanning.
- `ai-queue`: AI explanations and candidate fixes.
- `monitor-queue`: scheduled monitor triggers.
- `report-queue`: PDF/CSV rendering when it is heavy enough to require background processing.

Start with fewer queues if the current system is simpler. Separate queues when concurrency/resource policies differ. Configure timeouts, retries, backoff, retention/cleanup, and concurrency explicitly. Avoid duplicate scheduled jobs when monitor settings change; reconcile schedule changes consistently between MySQL and BullMQ. Check the installed BullMQ version and use its supported Job Scheduler API rather than copying outdated examples.

## 11. AI Fix Generation and Verification

AI-generated content is a **proposal**, not an authoritative correction.

- Send minimal relevant context: rule ID, impact, WCAG tags, failure summary, target selector, and a short, sanitized HTML/CSS snippet where appropriate.
- Do not send cookies, authorization headers, hidden user information, arbitrary entire DOM trees, or other unnecessary sensitive data.
- Require structured output where supported and validate it with a schema.
- Enforce response size/token limits and handle provider rate limits, timeouts, malformed output, and provider errors.
- Clearly distinguish `suggested`, `approved`, `verified`, `failed`, and `needs_manual_review` states.
- Do not claim an issue was fixed because the model generated code or because a code snippet was copied.
- Verify proposed corrections in a controlled document or browser environment with axe-core and relevant tests. Some accessibility requirements require manual review.
- Never automatically alter a live production website.

## 12. GitHub Pull Request Workflow

A URL scan by itself does not provide reliable access to the site's original source code. Source-level fixes require an explicitly connected repository and a mapping between the finding and source code.

Recommended flow:

1. User connects/installs the GitHub App and chooses an authorized repository.
2. Backend retrieves the necessary source files with the granted permissions.
3. A supported fix template or AI proposes a minimal patch.
4. Validate the patch and display the diff.
5. User approves/rejects individual proposed changes.
6. After explicit approval, create a new branch and commit the approved patch.
7. Open a pull request with a summary and test evidence.
8. Show the PR URL and status.

Security and safety:

- Never commit to the default branch automatically.
- Never merge PRs automatically.
- Do not create or commit AI-generated patches without explicit user approval.
- Request least-privilege GitHub App permissions.
- Keep installation tokens and app private keys server-side and out of logs.
- Validate repository, branch, file paths, patch size, and source-file state before writing.
- Avoid overwriting a file that changed after the diff was generated; fetch and re-check its base SHA before commit.

## 13. Multi-Page Crawling

A crawl should have user-defined page/depth limits and strict network boundaries.

- Begin at a validated `http` or `https` URL.
- Normalize URLs and remove fragments for deduplication; handle query parameters according to a documented crawl policy.
- Limit crawling to the permitted origin by default.
- Enforce maximum page count, crawl depth, response size, navigation timeout, total job time, and concurrency.
- Track discovered, queued, completed, failed, and skipped pages.
- Avoid repeatedly crawling logout, destructive-action, or known non-content URLs.
- Make it clear that client-rendered routes, authentication-protected pages, and sites that block automated access may not be fully crawled.

### Mandatory SSRF protections

Because users provide URLs to a server-side browser:

- Allow only `http:` and `https:` protocols.
- Reject localhost, loopback, private, link-local, reserved, and cloud-metadata addresses.
- Resolve hostnames and validate the resulting IP addresses before connection; account for redirects and DNS rebinding risks.
- Revalidate redirect targets and subresource/network requests as appropriate to the isolation model.
- Do not let the browser reach internal application services, Redis, MySQL, metadata endpoints, or arbitrary private network hosts.
- Enforce outbound network controls at the container/firewall level where possible; application URL validation alone is not sufficient.
- Do not disable browser security to make an arbitrary preview work.

## 14. Continuous Monitoring and Regression Detection

- Persist monitor configuration in MySQL; use BullMQ to schedule background runs.
- After each scan, compare the new snapshot with the configured baseline or latest successful prior snapshot.
- Classify findings as new, resolved, still present, or uncertain when fingerprints cannot be matched reliably.
- Compare per-rule and per-page findings, not only total counts.
- Alert on relevant new findings and avoid sending duplicate alerts for every repeated scan.
- Support pause/resume/delete and handle schedule changes without leaving orphaned jobs.
- Keep monitoring timezone behavior explicit if users can choose a local schedule.

## 15. Remediation Roadmap

The roadmap should prioritize fixes using transparent, deterministic inputs, such as:

- axe-core impact/severity;
- number of affected elements;
- number of affected pages;
- whether the issue occurs in a shared component/template;
- estimated effort range;
- confidence that the proposed fix is suitable.

AI can explain and help estimate remediation, but must not be the sole authority for severity. Make weights configurable and document the scoring formula. An internal priority score is a planning aid, not an official WCAG measure. Show that effort estimates are approximate.

## 16. Reporting

Reports may include:

- Target URL and page list/crawl scope.
- Scan date/time and tool/version information where available.
- Counts by severity and rule.
- Rule descriptions, affected selectors, and WCAG references from the scanner.
- Proposed remediations and their verification state.
- New/resolved findings compared with a baseline, if requested.
- Known limitations and checks that require manual review.

PDF and CSV exports should come from actual stored results. Do not label a site fully WCAG compliant just because no automated violations were found.

## 17. Environment and Secrets

Use environment variables for configuration. Provide an `.env.example` with placeholder values only, if appropriate.

Potential backend variables (align names to the existing application):

```dotenv
NODE_ENV=development
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=accessibility_auditor
DB_USER=
DB_PASSWORD=
REDIS_URL=redis://localhost:6379
AI_PROVIDER=
AI_API_KEY=
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
OBJECT_STORAGE_BUCKET=
```

Frontend may use a public API base URL, for example:

```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

Anything prefixed with `VITE_` is client-visible after build. Never put private keys, AI-provider secrets, database credentials, or GitHub tokens in frontend environment variables. Do not overwrite existing `.env` files or print their secret values.

## 18. Security and Reliability Checklist

Every related implementation should consider:

- URL validation and SSRF prevention.
- Request body and URL length limits.
- Authentication/authorization for user-specific data, if accounts are enabled.
- Rate limits for scan creation, AI calls, crawling, and report generation.
- Safe handling of untrusted HTML and browser output.
- Output encoding to reduce XSS risks.
- No unsafe use of `dangerouslySetInnerHTML` for untrusted content.
- Database parameterization and input validation.
- Secret redaction in logs.
- Bounded Chromium/BullMQ concurrency and cleanup.
- Timeouts and retry policies.
- Clear user-visible error messages without internal stack traces.
- CORS set to explicit trusted origins in production.
- Least-privilege GitHub permissions and explicit review before PR creation.
- Secure file handling and artifact size limits.

## 19. Testing Expectations

Add or update tests appropriate to the feature and the existing testing setup.

### Frontend

- Scan form validation and disabled/submitting states.
- Status rendering for queued, processing, completed, and failed scans.
- Filtering and searching issues.
- Selecting an issue updates preview selection/highlight state.
- Empty and error states.
- Keyboard operation, labels, and visible focus indicators.
- API failures do not produce fake success states.

### Backend/worker

- URL validation rejects unsafe and unsupported targets.
- Scan jobs update persisted status correctly.
- Worker cleanup occurs on failures.
- Violation data is normalized and stored correctly.
- Duplicate/retry jobs do not corrupt history.
- Comparison correctly identifies new/resolved/persistent findings.
- Fix verification status reflects actual test results.
- Monitoring schedules are reconciled on pause/resume/update/delete.
- GitHub PR creation requires approved changes and does not write to the default branch.

Do not add expensive end-to-end dependencies if a small unit/integration test will adequately cover the change; follow the existing test infrastructure first.

## 20. Implementation Roadmap

Build in small, testable phases, checking the current repository at each stage.

### Phase 1 — Core MVP

- Scan submission and queueing.
- Single-page Puppeteer + axe-core scan.
- MySQL persistence for scan snapshots and violations.
- Scan status and issue API.
- React split-screen audit workspace.
- Preview/highlighting approach with honest capability indicators.

### Phase 2 — Fix workflow

- AI explanations and candidate patches.
- Copy/preview fix.
- Isolated verification.
- Issue ignore/restore decisions.
- PDF/CSV report export.

### Phase 3 — Crawl and history

- Bounded multi-page crawl.
- Page-level ranking.
- Immutable scan snapshots.
- Scan comparison and regression classification.

### Phase 4 — Monitoring and roadmap

- Daily/weekly scheduling.
- New-issue notifications.
- Priority/effort roadmap.

### Phase 5 — GitHub workflow

- GitHub App/repository connection.
- Source mapping.
- Patch diff review.
- Explicitly approved branch/commit/PR creation.

Do not implement every phase in one large rewrite. Work on the feature requested by the user, preserve working parts, and keep the application buildable.

## 21. Definition of Done

A task is done only when the relevant criteria are met:

- The implementation matches the user request and this document.
- Existing project conventions and dependencies are respected.
- No unrelated files or configuration were changed unnecessarily.
- Loading, success, empty, and error states are handled where relevant.
- Data is retrieved from the real API when available; demo data is clearly isolated and labeled.
- Security implications have been addressed for URLs, browser execution, credentials, and untrusted content.
- Relevant lint/build/tests were run when available and the outcome is accurately reported.
- Any unimplemented backend contract or known limitation is documented clearly.

---

## 22. Instruction for the Next AI Agent

When beginning a new task, first inspect the repository and identify the current implementation. Do not assume this architecture has already been implemented. Make the smallest complete change that solves the current task, test it, and report exactly what changed and what remains. If the user requests frontend-only work, confine code changes to `frontend/`. If the user requests a full-stack feature, update the required frontend, backend, worker, schema/migrations, and documentation together, while preserving the repository's established conventions.
