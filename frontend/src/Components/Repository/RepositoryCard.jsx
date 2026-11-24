import { ExternalLink, GitFork, Star } from "lucide-react";
import Github from "../GithubIcon";

function RepositoryCard({ repository, onOpen }) {
  return (
    <button
      onClick={() => onOpen(repository)}
      className="focus-ring group surface flex min-h-48 flex-col rounded-lg p-5 text-left transition-colors hover:border-[#4c8599] hover:bg-[#192126]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Github size={18} className="text-slate-400" />
          <h3 className="font-semibold tracking-tight text-slate-100">{repository.name}</h3>
        </div>
        <ExternalLink size={16} className="text-slate-600 transition-colors group-hover:text-cyan-300" />
      </div>
      <p className="mb-6 min-h-10 text-sm leading-5 text-slate-400 line-clamp-2">
        {repository.description || "No description available"}
      </p>
      <div className="mt-auto flex gap-4 border-t border-slate-700/70 pt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Star size={14} />
          {repository.stars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={14} />
          {repository.forks}
        </span>
        <span className="ml-auto text-slate-500">{repository.language || "Unknown"}</span>
      </div>
    </button>
  );
}

export default RepositoryCard;
