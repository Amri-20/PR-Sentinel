import { ShieldCheck } from "lucide-react";
import Github from "../Components/GithubIcon";

function Home({ error, onConnectGitHub }) {
  const authError = new URLSearchParams(window.location.search).get("auth_error");
  const message =
    error ||
    (authError === "github_denied"
      ? "GitHub authorization was cancelled."
      : authError
        ? "GitHub authentication failed. Please try again."
        : "");

  return (
    <div className="app-shell min-h-screen text-white flex items-center justify-center p-6">
      <div className="surface max-w-md w-full rounded-xl p-7 text-center sm:p-9">
        <div className="mb-6 inline-flex rounded-lg border border-cyan-300/25 bg-[#1a3b45] p-3 text-cyan-200">
          <ShieldCheck size={35} />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">GitHub review workspace</p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight">PR Sentinel</h1>
        <p className="mb-8 text-sm leading-6 text-slate-400">
          AI-powered GitHub code review platform. Connect your GitHub account to
          get started.
        </p>
        <button
          onClick={onConnectGitHub}
          className="focus-ring flex w-full items-center justify-center gap-3 rounded-md bg-slate-100 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-white"
        >
          <Github size={21} />
          Continue with GitHub
        </button>
        {message && <p className="mt-5 text-sm text-rose-300">{message}</p>}
      </div>
    </div>
  );
}

export default Home;
