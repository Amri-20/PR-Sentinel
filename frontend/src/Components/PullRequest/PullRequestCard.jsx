function PullRequestCard({ pullRequest, onOpen }) {
  return (
    <button
      onClick={() => onOpen(pullRequest)}
      className="focus-ring group surface w-full rounded-lg p-4 text-left transition-colors hover:border-[#4c8599] hover:bg-[#192126] sm:p-5"
    >
      <div className="mb-3 font-semibold tracking-tight text-slate-100">
        #{pullRequest.number} {pullRequest.title}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
        <span className="text-slate-300">{pullRequest.author.username}</span>
        <span className="font-mono text-xs text-slate-500">
          {pullRequest.headBranch} → {pullRequest.baseBranch}
        </span>
        <span>{pullRequest.changedFiles} files changed</span>
        <span className="font-mono text-xs text-emerald-400">+{pullRequest.additions}</span>
        <span className="font-mono text-xs text-rose-400">-{pullRequest.deletions}</span>
      </div>
    </button>
  );
}

export default PullRequestCard;
