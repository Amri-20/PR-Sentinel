import PullRequestCard from "./PullRequestCard";

function PullRequestList({ pullRequests, onOpen }) {
  if (pullRequests.length === 0)
    return (
      <div className="surface-muted rounded-lg px-6 py-14 text-center">
        <p className="text-sm font-medium text-slate-300">No open pull requests</p>
        <p className="mt-1 text-sm text-slate-500">This repository has no pull requests ready for review.</p>
      </div>
    );
  return (
    <div className="space-y-2">
      {pullRequests.map((pullRequest) => (
        <PullRequestCard
          key={pullRequest.id}
          pullRequest={pullRequest}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

export default PullRequestList;
