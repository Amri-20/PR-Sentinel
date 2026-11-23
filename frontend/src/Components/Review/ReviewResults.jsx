const severityStyles = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  info: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-400">
        No review results available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-2">AI Review Results</h3>

        <p className="text-sm text-zinc-400 mb-5">
          {completedResults.length} files reviewed · {skippedResults.length}{" "}
          files skipped · {failedResults.length} files failed
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(severityCounts).map(([severity, count]) => (
            <div key={severity} className="bg-zinc-800/70 rounded-lg p-3">
              <p className="text-xs text-zinc-400 capitalize">{severity}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {completedResults.map((item, index) => {
        const review = item.review || item;

        return (
          <div
            key={`${item.filename}-${index}`}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          >
            <h4 className="font-mono text-sm text-indigo-400 break-all mb-3">
              {item.filename}
            </h4>

            {review.summary && (
              <p className="text-sm text-zinc-300 mb-4">{review.summary}</p>
            )}

            {(review.findings || []).length === 0 ? (
              <p className="text-sm text-emerald-400">
                No issues found in this file.
              </p>
            ) : (
              <div className="space-y-4">
                {review.findings.map((finding, findingIndex) => (
                  <div
                    key={findingIndex}
                    className="border border-zinc-800 rounded-lg p-4"
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

                    <h5 className="font-semibold text-white mb-2">
                      {finding.title}
                    </h5>

                    <p className="text-sm text-zinc-400 mb-4">
                      {finding.description}
                    </p>

                    {(finding.suggestedFix || finding.suggested_fix) && (
                      <div className="bg-zinc-800/70 rounded-lg p-3">
                        <p className="text-xs font-semibold text-emerald-400 mb-2">
                          Suggested Fix
                        </p>

                        <p className="text-sm text-zinc-300">
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
        <div className="bg-zinc-900 border border-yellow-500/20 rounded-xl p-5">
          <h4 className="font-semibold text-yellow-400 mb-3">Skipped Files</h4>

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
        <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-5">
          <h4 className="font-semibold text-red-400 mb-3">Files Not Reviewed</h4>
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
