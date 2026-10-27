import { useEffect, useRef, useState } from "react";
import Topbar from "../components/layout/Topbar.jsx";
import ScanForm from "../components/scan/ScanForm.jsx";
import SummaryCards from "../components/dashboard/SummaryCards.jsx";
import IssuePanel from "../components/issues/IssuePanel.jsx";
import CrawlModal from "../components/crawl/CrawlModal.jsx";
import WebsitePreviewScreenshot from "../components/preview/WebsitePreviewScreenshot.jsx";
import ReportActions from "../components/reports/ReportActions.jsx";
import MonitoringPanelConnected from "../components/monitoring/MonitoringPanelConnected.jsx";
import GitHubIntegration from "../components/github/GitHubIntegration.jsx";
import { createScan } from "../services/scanService.js";
import { createCrawl } from "../services/crawlService.js";
import useScanStatus from "../hooks/useScanStatus.js";
import useCrawlStatus from "../hooks/useCrawlStatus.js";
import RoadmapPanel from "../components/issues/RoadmapPanel.jsx";
import ScanComparison from "../components/scan/ScanComparison.jsx";
import {
  Activity,
  ArrowUpRight,
  Check,
  Clock3,
  FileDown,
  Globe2,
  Moon,
  Sun,
  X,
  ShieldCheck,
  ArrowLeft,
  BookOpen,
  History,
  Settings2,
  FileText,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Code2,
} from "lucide-react";

const demoHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<style>
*{box-sizing:border-box}
body{margin:0;font:15px Inter,Arial,sans-serif;color:#171717;background:#fff}
.nav{padding:18px 8%;border-bottom:1px solid #eee;display:flex;justify-content:space-between;font-weight:700}
.nav span{color:#f27645}
.hero{padding:70px 10%;background:#f7f6f3;min-height:290px}
.hero h1{font-size:42px;letter-spacing:-2px;max-width:500px;margin:8px 0 16px}
.hero-art{width:100%;height:170px;object-fit:cover;background:linear-gradient(120deg,#e8ae8a,#55443e);margin-top:22px}
.muted-copy{color:#a6a6a6}
.icon-only{width:38px;height:38px;border:0;background:#f3f3f3;border-radius:50%}
.content{padding:34px 10%;display:flex;gap:30px}
.content input{padding:12px;border:1px solid #ddd;border-radius:5px}
.content button{background:#151515;color:white;border:0;border-radius:5px;padding:12px 20px}
.badge{display:inline-block;background:#f5e9df;padding:6px 9px;border-radius:30px;font-size:11px}
.broken{outline:3px solid #f27645!important;outline-offset:4px;box-shadow:0 0 0 7px #f2764520}
small{color:#777}
</style>
</head>
<body>
<header class="nav">
<div>FIELDNOTE <span>STUDIO</span></div>
<button class="icon-only"><svg width="16" height="16"></svg></button>
</header>
<section class="hero">
<div class="badge">A little more room to think</div>
<h1>Make room for better work.</h1>
<p class="muted-copy">Thoughtful tools for the way your team works together.</p>
<button>Explore the collection</button>
<img class="hero-art" src="" alt="">
</section>
<section class="content">
<div>
<h2>Ideas worth sharing</h2>
<p>Good work starts with a thoughtful space.</p>
</div>
<form>
<label for="email">Work email</label><br>
<input id="email" placeholder="you@company.com">
<button>Join us</button>
</form>
</section>
</body>
</html>`;

const cardStyle =
  "overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.035),0_14px_35px_rgba(0,0,0,0.035)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/10";

const primaryButton =
  "inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-5 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)] active:scale-[0.98] dark:bg-orange-600 dark:hover:bg-orange-500";

const secondaryButton =
  "inline-flex min-h-[43px] items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 text-[12px] font-bold text-zinc-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400";

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral:
      "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    orange:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-500/10 dark:text-orange-400",
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.04em] ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
}

function safeHost(value) {
  try {
    return value ? new URL(value).host : "sample-page.design";
  } catch {
    return "sample-page.design";
  }
}

function PageHeader({ title, description, icon: Icon, onNavigate }) {
  return (
    <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {Icon && (
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 shadow-sm dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400 sm:flex">
            <Icon size={23} strokeWidth={1.8} />
          </div>
        )}

        <div>
          <h1 className="text-[30px] font-extrabold tracking-[-1.2px] text-zinc-900 dark:text-zinc-100 sm:text-[36px]">
            {title}
          </h1>

          <p className="mt-2 max-w-[650px] text-[13px] leading-[1.8] text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      {onNavigate && (
        <button
          type="button"
          onClick={() => onNavigate("workspace")}
          className={`${secondaryButton} shrink-0 self-start`}
        >
          <ArrowLeft size={16} />
          Workspace
        </button>
      )}
    </section>
  );
}

export default function AuditDashboard() {
  const [websiteDescription, setWebsiteDescription] = useState("");
  const [websiteCategory, setWebsiteCategory] = useState("General");
  const [issues, setIssues] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [expanded, setExpanded] = useState("");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All severities");
  const [page, setPage] = useState("workspace");
  const [url, setUrl] = useState("");
  const [scanId, setScanId] = useState("");
  const [crawlId, setCrawlId] = useState("");
  const [crawlPages, setCrawlPages] = useState([]);
  const [pageFilter, setPageFilter] = useState("");
  const [selectedPageUrl, setSelectedPageUrl] = useState("");
  const [crawlFormError, setCrawlFormError] = useState("");
  const [crawlSubmitting, setCrawlSubmitting] = useState(false);
  const [crawlMaxPages, setCrawlMaxPages] = useState(10);
  const [scanState, setScanState] = useState("idle");
  const [scanError, setScanError] = useState("");
  const [scanStage, setScanStage] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [screenshot, setScreenshot] = useState("");
  const [demo, setDemo] = useState(true);
  const [theme, setTheme] = useState("light");
  const [mobileTab, setMobileTab] = useState("issues");
  const [showCrawl, setShowCrawl] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("All issues");
  const [viewport, setViewport] = useState("desktop");

  const iframe = useRef(null);

  const { scan: scanResult, error: statusError } = useScanStatus(scanId);
  const { crawl: crawlResult, error: crawlStatusError } =
    useCrawlStatus(crawlId);

  const active = issues.find((issue) => issue.id === activeId);

  const previewPageUrl = active?.pageUrl || selectedPageUrl || url;

  const previewPage = crawlPages.find((item) => item.url === previewPageUrl);

  const previewScreenshots = crawlPages.length
    ? {
        desktop:
          previewPage?.screenshots?.desktop || previewPage?.screenshot || "",
        mobile:
          previewPage?.screenshots?.mobile ||
          previewPage?.screenshotMobile ||
          "",
      }
    : {
        desktop:
          scanResult?.screenshots?.desktop ||
          scanResult?.screenshot ||
          screenshot ||
          "",
        mobile:
          scanResult?.screenshots?.mobile || scanResult?.screenshotMobile || "",
      };

  const previewIssues = crawlPages.length
    ? issues.filter((issue) => issue.pageUrl === previewPageUrl)
    : issues;

  const visibleIssues = issues.filter(
    (issue) =>
      (severity === "All severities" ||
        issue.severity === severity.toLowerCase()) &&
      (filter !== "Open" || issue.status !== "Ignored") &&
      (filter !== "Verified" || issue.status === "Verified") &&
      (!pageFilter || issue.pageUrl === pageFilter) &&
      `${issue.title} ${issue.rule} ${issue.wcag}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!scanResult) return;

    setScanState(scanResult.status || "processing");
    setScanStage(scanResult.stage || "");
    setScanProgress(scanResult.progress || 0);
    if (scanResult.status === "failed")
      setScanError(scanResult.error || "The website could not be scanned.");

    if (scanResult.status === "completed" && Array.isArray(scanResult.issues)) {
      setIssues(scanResult.issues);
      setActiveId(scanResult.issues[0]?.id || "");
      setExpanded(scanResult.issues[0]?.id || "");
      setScreenshot(scanResult.screenshot || "");
    }
  }, [scanResult]);

  useEffect(() => {
    if (statusError) {
      setScanState("failed");
      setScanError(statusError);
    }
  }, [statusError]);

  useEffect(() => {
    if (!crawlResult) return;
    const progress = crawlResult.progress || {};
    setScanState(crawlResult.status);
    setScanStage(
      `Crawling: ${progress.completedPages || 0} completed, ${progress.failedPages || 0} failed, ${progress.skippedPages || 0} skipped`,
    );
    setScanProgress(
      crawlResult.status === "completed"
        ? 100
        : Math.floor(
            ((progress.completedPages + progress.failedPages || 0) /
              crawlMaxPages) *
              100,
          ),
    );
    if (crawlResult.status === "failed")
      setScanError(crawlResult.error || "No pages could be scanned.");
    if (["completed", "failed"].includes(crawlResult.status)) {
      const pages = crawlResult.pages || [];
      setCrawlPages(pages);
      setIssues(crawlResult.issues || []);
      setActiveId(crawlResult.issues?.[0]?.id || "");
      setExpanded(crawlResult.issues?.[0]?.id || "");
      setSelectedPageUrl(
        pages.find((item) => item.status === "completed")?.url || "",
      );
      setScreenshot(
        pages.find((item) => item.status === "completed")?.screenshot || "",
      );
    }
  }, [crawlResult, crawlMaxPages]);

  useEffect(() => {
    if (crawlStatusError) {
      setScanState("failed");
      setScanError(crawlStatusError);
    }
  }, [crawlStatusError]);

  async function startScan(event) {
    event?.preventDefault();
    setScanError("");

    let normalized;

    try {
      normalized = new URL(url).toString();

      if (!["http:", "https:"].includes(new URL(normalized).protocol)) {
        throw new Error();
      }
    } catch {
      setScanError("Enter a valid website URL, including https://");
      return;
    }

    setScanState("queued");
    setDemo(false);
    setIssues([]);
    setActiveId("");
    setExpanded("");
    setScreenshot("");
    setScanId("");
    setScanStage("queued");
    setScanProgress(0);
    setCrawlId("");
    setCrawlPages([]);
    setPageFilter("");
    setSelectedPageUrl("");
    setQuery("");
    setSeverity("All severities");
    setFilter("All issues");

    try {
      const scan = await createScan(normalized);

      setScanId(scan.scanId);
      setScanState(scan.status || "queued");
    } catch (error) {
      setScanState("failed");
      setScanError(
        error.userMessage || error.message || "The scan could not be started.",
      );
    }
  }

  async function startCrawl(config) {
    setCrawlFormError("");
    setCrawlSubmitting(true);
    try {
      const response = await createCrawl(config);
      if (!response.crawlId)
        throw new Error("The crawl API did not return a crawl ID.");
      setCrawlMaxPages(config.maxPages);
      setScanId("");
      setCrawlId(response.crawlId);
      setScanState(response.status || "queued");
      setScanError("");
      setScanStage("queued");
      setScanProgress(0);
      setDemo(false);
      setIssues([]);
      setActiveId("");
      setExpanded("");
      setCrawlPages([]);
      setPageFilter("");
      setSelectedPageUrl("");
      setScreenshot("");
      setQuery("");
      setSeverity("All severities");
      setFilter("All issues");
      setShowCrawl(false);
    } catch (error) {
      setCrawlFormError(
        error.userMessage || error.message || "The crawl could not be started.",
      );
    } finally {
      setCrawlSubmitting(false);
    }
  }

  function toggleDecision(issue) {
    const next = issue.status === "Ignored" ? "Not tested" : "Ignored";

    setIssues((items) =>
      items.map((item) =>
        item.id === issue.id ? { ...item, status: next } : item,
      ),
    );
  }

  async function copyFix(fix) {
    try {
      await navigator.clipboard.writeText(fix);
      setToast("Remediation guidance copied");
    } catch {
      setToast("Clipboard access is unavailable");
    }
  }

  function exportCsv() {
    if (!issues.length) {
      setToast("Run a scan before exporting a report");
      return;
    }

    const rows = [
      [
        "Page URL",
        "Issue",
        "Severity",
        "WCAG",
        "Rule",
        "Elements",
        "Remediation guidance",
      ],
      ...issues.map((issue) => [
        issue.pageUrl || url,
        issue.title,
        issue.severity,
        issue.wcag,
        issue.rule,
        issue.count,
        issue.fix,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const objectUrl = URL.createObjectURL(
      new Blob([csv], { type: "text/csv" }),
    );

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "accesslens-audit.csv";
    link.click();

    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div
      className={`app-shell theme-${theme} min-h-screen bg-[#f7f7f5] font-['DM_Sans'] text-zinc-900 transition-colors duration-300 dark:bg-[#131312] dark:text-zinc-100 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <Topbar
        page={page}
        onNavigate={setPage}
        theme={theme}
        onThemeChange={setTheme}
        demo={demo}
      />

      {page === "workspace" ? (
        <main
          id="workspace"
          className="mx-auto max-w-[1510px] px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-10"
        >
          <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[32px] font-extrabold leading-tight tracking-[-1.3px] text-zinc-900 dark:text-zinc-100 sm:text-[40px]">
                Audit workspace
              </h1>

              <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-[14px]">
                Find accessibility barriers, inspect findings, and build better
                web experiences.
              </p>
            </div>

            <div className="inline-flex w-fit shrink-0 items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[11px] font-semibold text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <Clock3 size={16} className="text-orange-500" />

              <span>
                {scanState === "completed" ? "Just scanned" : "Ready to scan"}
              </span>
            </div>
          </section>

          <div className="mb-5">
            <ScanForm
              description={websiteDescription}
              onDescriptionChange={setWebsiteDescription}
              category={websiteCategory}
              onCategoryChange={setWebsiteCategory}
              url={url}
              onUrlChange={setUrl}
              onSubmit={startScan}
              onCrawl={() => setShowCrawl(true)}
              busy={["queued", "processing", "scanning"].includes(scanState)}
              demo={demo}
              state={scanState}
              error={scanError}
              stage={scanStage}
              progress={scanProgress}
              mode={crawlId ? "crawl" : "scan"}
            />
          </div>

          <SummaryCards
            issues={issues}
            hasResults={
              scanState === "completed" || (demo && issues.length > 0)
            }
          />

          {crawlPages.length > 0 && (
            <section
              className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              aria-label="Crawl page results"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100">
                  Pages scanned
                </h2>
                <button
                  type="button"
                  onClick={() => setPageFilter("")}
                  className="text-[11px] font-semibold text-orange-600 dark:text-orange-400"
                >
                  Show all findings
                </button>
              </div>
              <div className="max-h-52 space-y-2 overflow-y-auto">
                {crawlPages.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    onClick={() => {
                      setPageFilter(item.url);
                      setSelectedPageUrl(item.url);
                      setActiveId(
                        item.issues?.[0]
                          ? issues.find((issue) => issue.pageUrl === item.url)
                              ?.id || ""
                          : "",
                      );
                    }}
                    className={`flex w-full flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-left text-[11px] dark:text-zinc-300 ${pageFilter === item.url ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-500/10" : "border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <span
                      className="min-w-0 flex-1 truncate font-mono"
                      title={item.url}
                    >
                      {item.url}
                    </span>
                    <span className="capitalize">{item.status}</span>
                    <span>
                      {item.status === "completed"
                        ? `${item.summary?.total || 0} findings`
                        : item.reason || item.error || ""}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-extrabold tracking-[-0.6px] text-zinc-900 dark:text-zinc-100 sm:text-[23px]">
                  Findings & inspection
                </h2>

                <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Explore detected issues and inspect affected elements.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-1 md:hidden dark:border-zinc-700 dark:bg-zinc-800">
                  {[
                    ["issues", "Issues"],
                    ["preview", "Preview"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMobileTab(id)}
                      aria-pressed={mobileTab === id}
                      className={`rounded-lg px-4 py-2 text-[11px] font-bold transition-all duration-200 ${
                        mobileTab === id
                          ? "bg-white text-orange-600 shadow-sm dark:bg-zinc-700 dark:text-orange-400"
                          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <span className="hidden max-w-[250px] items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] font-medium text-zinc-500 shadow-sm sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <Globe2 size={14} className="shrink-0 text-orange-500" />
                  <span className="truncate">{safeHost(url)}</span>
                </span>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
              <IssuePanel
                websiteCategory={websiteCategory}
                className={mobileTab === "preview" ? "hidden md:flex" : ""}
                issues={issues}
                visibleIssues={visibleIssues}
                activeId={activeId}
                expanded={expanded}
                query={query}
                onQueryChange={setQuery}
                status={filter}
                onStatusChange={setFilter}
                severity={severity}
                onSeverityChange={setSeverity}
                onSort={() => setToast("Sorted by severity")}
                onSelect={(issue, inspectOnly) => {
                  setActiveId(issue.id);
                  if (issue.pageUrl) setSelectedPageUrl(issue.pageUrl);

                  if (!inspectOnly) {
                    setExpanded(expanded === issue.id ? "" : issue.id);
                  }
                }}
                onCopy={copyFix}
                onIgnore={toggleDecision}
                onAction={setToast}
                hasResults={scanState === "completed"}
              />

              <WebsitePreviewScreenshot
                className={mobileTab === "issues" ? "hidden md:flex" : ""}
                screenshot={previewScreenshots.desktop}
                screenshotMobile={previewScreenshots.mobile}
                url={previewPageUrl}
                issues={previewIssues}
                activeId={activeId}
                activeIssue={active}
                viewport={viewport}
                onViewportChange={setViewport}
                onSelectIssue={(id) => {
                  setActiveId(id);
                  setExpanded(id);
                  setMobileTab("issues");
                }}
                onRefresh={() => {
                  if (!url) {
                    setToast("Enter a website URL first.");
                    return;
                  }

                  startScan();
                }}
              />
            </div>
          </section>

          <RoadmapPanel issues={issues} />

          <ReportActions
            onExport={exportCsv}
            onCompare={() => setShowCompare(true)}
            onPullRequest={() => setPage("github")}
          />
          <ScanComparison currentScanId={scanId} currentUrl={url} open={showCompare} onClose={() => setShowCompare(false)} />

          <footer className="mt-9 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-[11px] text-zinc-400 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:text-zinc-500">
            <span className="flex items-center gap-2 font-bold tracking-[0.04em]">
              ACCESSLENS
              <span className="h-1 w-1 rounded-full bg-orange-500" />
              BUILT FOR A MORE ACCESSIBLE WEB
            </span>

            <span>
              Automated results are a guide and do not establish WCAG
              conformance.
            </span>
          </footer>
        </main>
      ) : (
        <main className="mx-auto max-w-[1510px] px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-10">
          <AppPage
            page={page}
            theme={theme}
            setTheme={setTheme}
            onToast={setToast}
            onExport={exportCsv}
            onNavigate={setPage}
          />
        </main>
      )}

      <CrawlModal
        open={showCrawl}
        url={url}
        onUrlChange={setUrl}
        onClose={() => {
          setShowCrawl(false);
          setCrawlFormError("");
        }}
        onStart={startCrawl}
        busy={crawlSubmitting}
        error={crawlFormError}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[100] flex max-w-[min(420px,calc(100vw-40px))] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-[12px] font-semibold text-zinc-700 shadow-[0_12px_45px_rgba(0,0,0,0.15)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Check size={16} />
          </span>

          <span className="flex-1 leading-relaxed">{toast}</span>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function AppPage({ page, theme, setTheme, onToast, onExport, onNavigate }) {
  const [frequency, setFrequency] = useState("Weekly");
  const [monitorUrl, setMonitorUrl] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [repo, setRepo] = useState("");

  const title = {
    history: "Scan history",
    monitoring: "Monitoring",
    github: "GitHub integration",
    reports: "Reports",
    docs: "Documentation",
    settings: "Settings",
  }[page];

  const descriptions = {
    history: "Review previous runs and compare accessibility changes.",
    monitoring:
      "Schedule recurring scans and get notified when new issues appear.",
    github:
      "Review proposed source changes and open pull requests with approval.",
    reports: "Export findings and remediation details for your team.",
    docs: "Learn how to use AccessLens and understand audit results.",
    settings: "Manage your workspace preferences and API connection.",
  };

  const icons = {
    history: History,
    reports: FileText,
    docs: BookOpen,
    settings: Settings2,
  };

  if (page === "monitoring") {
    return <MonitoringPanelConnected />;
  }

  if (page === "github") {
    return <GitHubIntegration />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={descriptions[page]}
        icon={icons[page]}
        onNavigate={onNavigate}
      />

      {page === "history" && (
        <section className={cardStyle}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 px-6 py-6 sm:px-8 dark:border-zinc-800">
            <div>
              <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Previous scans
              </h2>

              <p className="mt-2 text-[12px] text-zinc-500 dark:text-zinc-400">
                Scan history is populated from saved backend scan runs.
              </p>
            </div>

            <Badge tone="orange">API REQUIRED</Badge>
          </div>

          <div className="flex min-h-[370px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
              <Clock3 size={28} strokeWidth={1.6} />
            </div>

            <h3 className="mt-6 text-[17px] font-bold text-zinc-800 dark:text-zinc-200">
              No saved scans yet
            </h3>

            <p className="mt-3 max-w-[440px] text-[12px] leading-7 text-zinc-500 dark:text-zinc-400">
              The current backend does not expose scan history. Completed runs
              will appear here when persistence and a history endpoint are
              connected.
            </p>

            <code className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 font-mono text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              GET /api/scans
            </code>
          </div>
        </section>
      )}

      {page === "reports" && (
        <>
          <section className={cardStyle}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 px-6 py-6 sm:px-8 dark:border-zinc-800">
              <div>
                <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Export audit results
                </h2>

                <p className="mt-2 max-w-[640px] text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Download findings with severity, WCAG references, selectors,
                  and remediation suggestions.
                </p>
              </div>

              <Badge>CSV</Badge>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 sm:flex-row sm:items-center dark:border-zinc-700 dark:bg-zinc-800/40">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400">
                  <FileDown size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                    Accessibility findings
                  </h3>

                  <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Comma-separated values · opens in spreadsheet tools
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onExport}
                  className={primaryButton}
                >
                  <FileDown size={16} />
                  Download CSV
                </button>
              </div>

              <p className="mt-5 text-[11px] leading-7 text-zinc-500 dark:text-zinc-400">
                PDF export and saved report history require report generation
                support from the backend. Automated results do not establish
                WCAG conformance.
              </p>
            </div>
          </section>

          <section className={`${cardStyle} p-6 sm:p-8`}>
            <h2 className="text-[17px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Included report fields
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Issue title and rule ID",
                "Severity and affected node count",
                "WCAG criterion",
                "Affected selector and snippet",
                "Suggested remediation",
                "Verification state",
              ].map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-3 text-[12px] text-zinc-600 dark:text-zinc-400"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Check size={14} />
                  </span>

                  {field}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {page === "docs" && (
        <>
          <section className={`${cardStyle} p-7 sm:p-9`}>
            <Badge tone="orange">QUICK GUIDE</Badge>

            <h2 className="mt-6 text-[25px] font-extrabold tracking-[-0.8px] text-zinc-900 dark:text-zinc-100">
              Make your first audit useful
            </h2>

            <p className="mt-3 max-w-[720px] text-[13px] leading-[1.9] text-zinc-500 dark:text-zinc-400">
              AccessLens combines automated checks with a review workflow. Treat
              every result as a finding to investigate, not a compliance
              verdict.
            </p>

            <button
              type="button"
              onClick={() =>
                onToast(
                  "Return to Workspace from the top navigation to start an audit.",
                )
              }
              className={`${primaryButton} mt-6`}
            >
              Open workspace
              <ArrowUpRight size={16} />
            </button>
          </section>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                number: "01",
                title: "Run a scan",
                description:
                  "Enter an HTTP or HTTPS website URL and choose Scan website. The app reports the job state returned by the scan API.",
                icon: Globe2,
              },
              {
                number: "02",
                title: "Inspect findings",
                description:
                  "Filter by severity, open an issue to review its rule and selector, then select it to locate the matching node in the controlled sample preview.",
                icon: Activity,
              },
              {
                number: "03",
                title: "Review remediations",
                description:
                  "Suggested changes are proposals. Copying a suggestion does not change the target site. Verify changes in an isolated environment before shipping.",
                icon: Code2,
              },
              {
                number: "04",
                title: "Understand the limits",
                description:
                  "Automated checks catch common issues, but many accessibility requirements need human review. A clean scan is not proof of WCAG conformance.",
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.number}
                  className={`${cardStyle} group p-6 hover:-translate-y-1 sm:p-7`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] font-bold text-orange-500">
                      {item.number}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-transform duration-300 group-hover:scale-110 dark:bg-orange-500/10 dark:text-orange-400">
                      <Icon size={19} />
                    </div>
                  </div>

                  <h3 className="mt-5 text-[17px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[12px] leading-[1.85] text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <section className={`${cardStyle} p-6 sm:p-8`}>
            <h2 className="text-[17px] font-extrabold text-zinc-900 dark:text-zinc-100">
              Backend capabilities
            </h2>

            <div className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800">
              {[
                ["POST /api/scans", "Submit scan"],
                ["GET /api/scans/:id", "Read scan status"],
                ["POST /api/crawls", "Not implemented"],
                ["POST /api/fixes/:id/verify", "Not implemented"],
              ].map(([endpoint, description]) => (
                <div
                  key={endpoint}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <code className="w-fit rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {endpoint}
                  </code>

                  <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {page === "settings" && (
        <>
          <section className={cardStyle}>
            <div className="border-b border-zinc-100 px-6 py-6 sm:px-8 dark:border-zinc-800">
              <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Appearance
              </h2>

              <p className="mt-2 text-[12px] text-zinc-500 dark:text-zinc-400">
                Adjust the workspace to your preference.
              </p>
            </div>

            <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <h3 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
                  Color theme
                </h3>

                <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Choose a light or dark workspace.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                {[
                  ["light", "Light", Sun],
                  ["dark", "Dark", Moon],
                ].map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-bold transition-all duration-200 ${
                      theme === value
                        ? "bg-white text-orange-600 shadow-sm dark:bg-zinc-700 dark:text-orange-400"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={cardStyle}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 px-6 py-6 sm:px-8 dark:border-zinc-800">
              <div>
                <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                  API connection
                </h2>

                <p className="mt-2 text-[12px] text-zinc-500 dark:text-zinc-400">
                  The frontend uses this public API base URL.
                </p>
              </div>

              <Badge>CLIENT CONFIG</Badge>
            </div>

            <div className="px-6 py-7 sm:px-8">
              <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700 dark:bg-zinc-800/50">
                <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400">
                  API base URL
                </span>

                <code className="break-all rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {import.meta.env.VITE_API_BASE_URL ||
                    "Same origin (Vite /api proxy → localhost:5001)"}
                </code>
              </div>

              <p className="mt-5 text-[11px] leading-[1.9] text-zinc-500 dark:text-zinc-400">
                Set{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-1 font-mono dark:bg-zinc-800">
                  VITE_API_BASE_URL
                </code>{" "}
                in the frontend environment to connect a different API. Never
                put private keys or server credentials in Vite variables.
              </p>
            </div>
          </section>

          <section className={`${cardStyle} p-6 sm:p-8`}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                <AlertCircle size={19} />
              </div>

              <div>
                <h2 className="text-[16px] font-extrabold text-zinc-900 dark:text-zinc-100">
                  About scan results
                </h2>

                <p className="mt-2 text-[12px] leading-[1.9] text-zinc-500 dark:text-zinc-400">
                  The score shown in the workspace is a project-defined estimate
                  based on issue severity and affected element counts. It is not
                  an official accessibility rating.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// Voice/categories helpers could be added; minimal implementation
