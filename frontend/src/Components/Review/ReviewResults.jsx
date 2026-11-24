const severityStyles = {
  critical: "bg-rose-400/12 text-rose-300 border-rose-400/30",
  high: "bg-orange-400/12 text-orange-300 border-orange-400/30",
  medium: "bg-amber-300/12 text-amber-200 border-amber-300/25",
  low: "bg-sky-400/12 text-sky-300 border-sky-400/25",
  info: "bg-slate-400/10 text-slate-300 border-slate-400/20",
};

const categoryStyles = {
  bug: "text-red-400",
  security: "text-orange-400",
  performance: "text-yellow-400",
  quality: "text-indigo-400",
};

function ReviewResults({ results = [] }) {
  const completedResults = results.filter(
    (item) => item.status === "completed",
  );

  const skippedResults = results.filter((item) => item.status === "skipped");
  const failedResults = results.filter((item) => item.status === "failed");

  const findings = completedResults.flatMap((item) => {
    const review = item.review || item;

    return (review.findings || []).map((finding) => ({
      ...finding,
      filename: finding.file || item.filename,
      suggestedFix: finding.suggestedFix || finding.suggested_fix,
    }));
  });

  const severityCounts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  if (results.length === 0) {
    return (
    <div className="surface-muted rounded-lg p-6 text-sm text-slate-400">
        No review results are available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface rounded-lg p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">Review report</p><h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-100">AI Review Results</h3></div>
          <p className="text-xs text-slate-500">Generated for this pull request</p>
        </div>

        <p className="mb-5 text-sm text-slate-400">
          {completedResults.length} files reviewed · {skippedResults.length}{" "}
          files skipped · {failedResults.length} files failed
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(severityCounts).map(([severity, count]) => (
            <div key={severity} className="rounded-md border border-slate-700/70 bg-[#14191d] p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{severity}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-200">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {completedResults.map((item, index) => {
        const review = item.review || item;

        return (
          <div
            key={`${item.filename}-${index}`}
            className="surface rounded-lg p-5"
          >
            <h4 className="mb-3 font-mono text-xs text-cyan-300 break-all">
              {item.filename}
            </h4>

            {review.summary && (
              <p className="mb-4 text-sm leading-6 text-slate-300">{review.summary}</p>
            )}

            {(review.findings || []).length === 0 ? (
              <p className="text-sm text-emerald-300">
                No issues found in this file.
              </p>
            ) : (
              <div className="space-y-4">
                {review.findings.map((finding, findingIndex) => (
                  <div
                    key={findingIndex}
                    className="rounded-md border border-slate-700/80 bg-[#14191d] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-semibold uppercase px-2 py-1 rounded border ${
                          severityStyles[finding.severity] ||
                          severityStyles.info
                        }`}
                      >
                        {finding.severity}
                      </span>

                      <span
                        className={`text-xs font-semibold uppercase ${
                          categoryStyles[finding.category] || "text-zinc-400"
                        }`}
                      >
                        {finding.category}
                      </span>

                      {finding.line != null && (
                        <span className="text-xs text-zinc-500">
                          Line {finding.line}
                        </span>
                      )}
                    </div>

                    <h5 className="mb-2 font-semibold text-slate-100">
                      {finding.title}
                    </h5>

                    <p className="mb-4 text-sm leading-6 text-slate-400">
                      {finding.description}
                    </p>

                    {(finding.suggestedFix || finding.suggested_fix) && (
                      <div className="rounded-md border border-cyan-300/15 bg-[#143039]/45 p-3">
                        <p className="mb-2 text-xs font-semibold text-cyan-200">
                          Suggested Fix
                        </p>

                        <p className="text-sm leading-6 text-slate-300">
                          {finding.suggestedFix || finding.suggested_fix}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {skippedResults.length > 0 && (
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-5">
          <h4 className="mb-3 font-semibold text-amber-200">Skipped Files</h4>

          {skippedResults.map((item, index) => (
            <div key={`${item.filename}-${index}`} className="text-sm mb-2">
              <p className="text-zinc-300 font-mono break-all">
                {item.filename}
              </p>
              <p className="text-zinc-500">
                {item.reason || "Review unavailable"}
              </p>
            </div>
          ))}
        </div>
      )}

      {failedResults.length > 0 && (
        <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-5">
          <h4 className="mb-3 font-semibold text-rose-300">Files Not Reviewed</h4>
          {failedResults.map((item, index) => (
            <div key={`${item.filename}-${index}`} className="text-sm mb-2">
              <p className="text-zinc-300 font-mono break-all">{item.filename}</p>
              <p className="text-zinc-500">{item.reason || "Review failed"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewResults;
