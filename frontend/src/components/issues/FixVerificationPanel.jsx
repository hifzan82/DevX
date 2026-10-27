
import { useEffect, useState } from 'react';
import {
  previewFix,
  verifyFixDetailed,
} from '../../services/fixService.js';

export default function FixVerificationPanel({
  issue,
  suggestion,
  onToast,
}) {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState('');

  const fix = suggestion?.suggestedFix || '';
  const type = suggestion?.type || '';

  useEffect(() => {
    setPreview(null);
    setResult(null);
  }, [issue.id, fix]);

  async function run(action) {
    if (!fix) {
      onToast?.('Generate a fix before previewing or verifying it');
      return;
    }

    setLoading(action);

    try {
      const payload = {
        html: issue.snippet,
        fix,
        issue,
        type,
      };

      const response =
        action === 'preview'
          ? await previewFix(payload)
          : await verifyFixDetailed(payload);

      if (action === 'preview') {
        setPreview(response);
      } else {
        setResult(response);
      }

      onToast?.(response.message || response.status);
    } catch (error) {
      onToast?.(
        error.userMessage ||
        error.message ||
        'Verification failed'
      );
    } finally {
      setLoading('');
    }
  }

  return (
    <section
      className="space-y-3 border-t border-zinc-100 px-4 pb-5 pt-4 text-[11px] dark:border-zinc-800 sm:px-5"
      aria-label="Isolated fix verification"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
            Isolated fix verification
          </h4>

          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Temporary element-level test. Never modifies the scanned website.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            data-verification-action="preview"
            disabled={Boolean(loading) || !fix}
            onClick={() => run('preview')}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 shadow-sm hover:border-orange-300 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {loading === 'preview' ? 'Loading…' : 'Preview'}
          </button>

          <button
            type="button"
            data-verification-action="verify"
            disabled={Boolean(loading) || !fix}
            onClick={() => run('verify')}
            className="rounded-lg bg-orange-600 px-3 py-2 font-semibold text-white hover:bg-orange-500 disabled:opacity-40"
          >
            {loading === 'verify' ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </div>

      {preview && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/50">
            <p className="mb-2 font-bold text-zinc-600 dark:text-zinc-300">
              Before
            </p>

            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-zinc-700 dark:text-zinc-300">
              {preview.beforeHtml || issue.snippet}
            </pre>
          </div>

          <div className="min-w-0 rounded-xl border border-orange-200 bg-orange-50/40 p-3 dark:border-orange-900/50 dark:bg-orange-950/10">
            <p className="mb-2 font-bold text-orange-700 dark:text-orange-400">
              Proposed (unverified)
            </p>

            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-zinc-700 dark:text-zinc-300">
              {preview.afterHtml || fix}
            </pre>
          </div>

          <p className="text-zinc-500 sm:col-span-2 dark:text-zinc-400">
            {preview.message}
          </p>
        </div>
      )}

      {result && (
        <div
          role="status"
          className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
        >
          <p className="font-bold text-zinc-800 dark:text-zinc-200">
            {result.status}
            <span className="font-normal text-zinc-500">
              {' '}· isolated-element test only
            </span>
          </p>

          <p className="leading-5 text-zinc-600 dark:text-zinc-400">
            {result.message}
          </p>

          <p className="text-zinc-500 dark:text-zinc-400">
            New violations:{' '}
            {result.newViolations?.map((v) => v.rule || v).join(', ') ||
              'None detected'}
          </p>

          <p className="text-zinc-500 dark:text-zinc-400">
            Remaining violations:{' '}
            {result.remainingViolations
              ?.map((v) => v.rule || v)
              .join(', ') || 'None detected'}
          </p>
        </div>
      )}
    </section>
  );
}
