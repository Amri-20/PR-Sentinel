import { ExternalLink, GitFork, Star } from "lucide-react";
import Github from "../GithubIcon";

function RepositoryCard({ repository, onOpen }) {
  return <button onClick={() => onOpen(repository)} className="text-left bg-zinc-900 border border-zinc-800 hover:border-indigo-500 rounded-xl p-5 transition"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Github size={19} /><h3 className="font-semibold">{repository.name}</h3></div><ExternalLink size={16} className="text-zinc-500" /></div><p className="text-sm text-zinc-400 line-clamp-2 min-h-10 mb-5">{repository.description || "No description available"}</p><div className="flex gap-4 text-xs text-zinc-400"><span className="flex items-center gap-1"><Star size={14} />{repository.stars}</span><span className="flex items-center gap-1"><GitFork size={14} />{repository.forks}</span><span>{repository.language || "Unknown"}</span></div></button>;
}

export default RepositoryCard;
