import PullRequestCard from "./PullRequestCard";

function PullRequestList({ pullRequests, onOpen }) {
  if (pullRequests.length === 0) return <p className="text-zinc-400 py-10">No open pull requests in this repository.</p>;
  return <div className="space-y-4">{pullRequests.map((pullRequest) => <PullRequestCard key={pullRequest.id} pullRequest={pullRequest} onOpen={onOpen} />)}</div>;
}

export default PullRequestList;
