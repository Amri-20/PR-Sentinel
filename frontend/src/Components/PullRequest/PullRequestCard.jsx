function PullRequestCard({ pullRequest, onOpen }) {
  return <button onClick={() => onOpen(pullRequest)} className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-indigo-500 rounded-xl p-5"><div className="font-semibold mb-2">#{pullRequest.number} {pullRequest.title}</div><div className="text-sm text-zinc-400 flex flex-wrap gap-4"><span>{pullRequest.author.username}</span><span>{pullRequest.headBranch} → {pullRequest.baseBranch}</span><span>{pullRequest.changedFiles} files changed</span><span className="text-emerald-400">+{pullRequest.additions}</span><span className="text-red-400">-{pullRequest.deletions}</span></div></button>;
}

export default PullRequestCard;
