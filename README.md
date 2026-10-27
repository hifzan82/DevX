# AccessLens

Single-page accessibility audits using Puppeteer and axe-core. Results and screenshots stay in the Node process for up to one hour; they are not saved to a database. Automated checks are not a WCAG compliance verdict.

Run `cd backend && npm ci && npm run dev` to start the API and scan workers together on port 5001. Restart this command after backend code changes. In a second terminal, run `cd frontend && npm ci && npm run dev`. Vite forwards `/api` requests to the local backend; set `VITE_API_BASE_URL` when hosting the frontend separately.

The API exposes `POST /api/scans` with `{ "url": "https://example.com" }`, `GET /api/scans/:scanId`, and `GET /api/scans/:scanId/issues`. Poll the status endpoint until `completed` or `failed`. Up to two scans run at once and twenty wait in memory. Restarting the backend clears the temporary results.

For a multi-page crawl, submit `POST /api/crawls` with `{ "url": "https://example.com", "maxPages": 10, "maxDepth": 2, "sameOrigin": true }`. Poll `GET /api/crawls/:crawlId` for progress and page-wise findings; `GET /api/crawls/:crawlId/pages` returns the page report. Crawls follow links breadth first, preserve non-tracking query parameters, strip fragments and common tracking parameters, and cap the scope at 20 pages and depth 3. One crawl runs at a time; results expire from memory after an hour. A site can block automated browsers, in which case that page is reported as failed.

Scans accept public HTTP(S) websites on standard ports. The worker checks DNS and each browser request, blocks private addresses and WebSockets, and limits requests and time spent navigating. Deploy the worker with outbound firewall rules that also deny private, loopback, link-local, and metadata networks; application checks alone cannot fully prevent DNS rebinding. The preview is a non-interactive screenshot captured at 1280 × 900, so elements outside that viewport may not be highlighted.

The project estimate shown in SummaryCards starts at 100 and subtracts 12, 7, 4, or 2 per critical, serious, moderate, or minor occurrence, with a floor of zero. It is not an official accessibility score. Remediation text comes from axe rule guidance; no code patch or verification is claimed.
