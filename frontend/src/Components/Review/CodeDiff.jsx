function CodeDiff({ file }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"><div className="flex justify-between gap-3 mb-3"><span className="font-mono text-sm break-all">{file.filename}</span><span className="text-xs text-zinc-500">{file.status}</span></div><div className="flex gap-4 text-xs mb-3"><span className="text-emerald-400">+{file.additions}</span><span className="text-red-400">-{file.deletions}</span><span className="text-zinc-500">{file.changes} changes</span></div><pre className="text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-60">{file.patch || "Patch unavailable for this file"}</pre></div>;
}

export default CodeDiff;
