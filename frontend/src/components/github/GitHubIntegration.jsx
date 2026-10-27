
import { useState } from 'react';
import {
  AlertTriangle,
  Github,
  RefreshCw,
  ChevronDown,
  GitPullRequest,
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
  ArrowUpRight,
  GitBranch,
} from 'lucide-react';
import { listRepositories } from '../../services/githubService.js';
import PullRequestReview from './PullRequestReview.jsx';

export default function GitHubIntegration() {
  const [repositories, setRepositories] = useState([]);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function connect() {
    setLoading(true);

    try {
      const result = await listRepositories();
      setRepositories(
        Array.isArray(result) ? result : result.repositories || []
      );
      setError('');
    } catch (e) {
      setError(
        e.userMessage || e.message || 'GitHub is not connected.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-[-1.2px] text-zinc-900 dark:text-zinc-100 sm:text-[36px]">
            GitHub integration
          </h1>

          <p className="mt-2 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Connect your repository, review accessibility fixes, and prepare
            pull requests.
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-bold ${
            repositories.length
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-400'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              repositories.length ? 'bg-emerald-500' : 'bg-orange-500'
            }`}
          />
          {repositories.length ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.035),0_15px_40px_rgba(0,0,0,0.035)] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-5 border-b border-zinc-100 px-6 py-7 sm:flex-row sm:items-start sm:px-8 dark:border-zinc-800">
          <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-[0_5px_16px_rgba(0,0,0,0.13)] dark:bg-zinc-800">
            <Github size={27} strokeWidth={1.8} />
          </div>

          <div className="flex-1">
            <h2 className="text-[19px] font-extrabold tracking-[-0.5px] text-zinc-900 dark:text-zinc-100">
              Connect an authorized repository
            </h2>

            <p className="mt-2 max-w-[620px] text-[12px] leading-[1.8] text-zinc-500 dark:text-zinc-400">
              Connect your GitHub repositories to review proposed
              accessibility changes and prepare pull requests. Repository
              access requires server-side GitHub App configuration.
            </p>

            <button
              type="button"
              onClick={connect}
              disabled={loading}
              className="group mt-5 inline-flex h-[44px] items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-5 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              <RefreshCw
                size={16}
                className={loading ? 'animate-spin' : 'transition-transform duration-500 group-hover:rotate-45'}
              />
              {loading ? 'Loading repositories...' : 'Load repositories'}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 dark:border-red-900/50 dark:bg-red-950/20 sm:mx-8"
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />
            <p className="text-[12px] leading-relaxed text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        <div className="px-6 py-7 sm:px-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <GitBranch size={19} />
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                Repository selection
              </h3>

              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Choose a repository to manage accessibility fixes.
              </p>
            </div>
          </div>

          <label
            htmlFor="github-repository"
            className="mb-2.5 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
          >
            Repository
          </label>

          <div className="relative max-w-[580px]">
            <Github
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <select
              id="github-repository"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="h-[49px] w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-11 pr-11 text-[12px] font-medium text-zinc-700 outline-none transition-all duration-200 hover:border-zinc-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="">Select a repository</option>

              {repositories.map((repo) => (
                <option
                  key={repo.id || repo.full_name}
                  value={repo.full_name || repo.name}
                >
                  {repo.full_name || repo.name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>

          {selected && (
            <div className="mt-4 flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              Repository selected: {selected}
            </div>
          )}
        </div>

        <div className="grid gap-4 border-t border-zinc-100 bg-zinc-50/60 px-6 py-6 sm:grid-cols-3 sm:px-8 dark:border-zinc-800 dark:bg-zinc-800/20">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400">
              <LockKeyhole size={17} />
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                Secure connection
              </h4>
              <p className="mt-1 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                GitHub tokens remain server-side.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400">
              <ShieldCheck size={17} />
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                Review first
              </h4>
              <p className="mt-1 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Approve proposed patches before submission.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm dark:bg-zinc-800 dark:text-orange-400">
              <GitPullRequest size={17} />
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                Pull request workflow
              </h4>
              <p className="mt-1 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Prepare reviewed fixes in a separate branch.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.035),0_15px_40px_rgba(0,0,0,0.035)] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-6 py-5 sm:px-8 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
            <GitPullRequest size={19} />
          </div>

          <div>
            <h2 className="text-[16px] font-extrabold tracking-[-0.4px] text-zinc-900 dark:text-zinc-100">
              Pull request review
            </h2>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Review and approve suggested accessibility changes.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <PullRequestReview
            repository={selected}
            onCreate={() =>
              setError('No approved patches are available.')
            }
            onApprove={() => {}}
            onReject={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
