function CodeDiff({ file }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/80 bg-[#151a1e]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/80 bg-[#1a2025] px-4 py-3">
        <span className="font-mono text-xs font-medium leading-5 text-slate-200 break-all">{file.filename}</span>
        <span className="shrink-0 rounded border border-slate-600 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">{file.status}</span>
      </div>
      <div className="flex gap-4 px-4 py-2 text-xs">
        <span className="text-emerald-400">+{file.additions}</span>
        <span className="text-red-400">-{file.deletions}</span>
        <span className="text-zinc-500">{file.changes} changes</span>
      </div>
      <pre className="max-h-80 overflow-auto border-t border-slate-800 bg-[#101518] p-4 font-mono text-xs leading-5 text-slate-300 whitespace-pre-wrap">
        {file.patch || "Patch unavailable for this file"}
      </pre>
    </div>
  );
}

export default CodeDiff;
