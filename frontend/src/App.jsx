import { useCallback, useEffect, useState } from "react";
import { FaGithub as Github } from "react-icons/fa";
import {
  GitPullRequest,
  ExternalLink,
  LogOut,
  RefreshCw,
  ShieldCheck,
  FileCode2,
  ArrowLeft,
  Star,
  GitFork,
  Loader2,
} from "lucide-react";

import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [pullRequests, setPullRequests] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRepositories = useCallback(async () => {
    const response = await api.get("/github/repos");

    setRepositories(response.data.repositories);
  }, []);

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/auth/me");

      setUser(response.data.user);

      await fetchRepositories();
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
      } else {
        setError(err.response?.data?.message || "Unable to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchRepositories]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const connectGitHub = () => {
    window.location.href = "/api/v1/auth/github";
  };

  const logout = async () => {
    try {
      await api.get("/v1/auth/logout");

      setUser(null);
      setRepositories([]);
      setSelectedRepo(null);
      setPullRequests([]);
      setSelectedPR(null);
      setFiles([]);
    } catch (err) {
      setError("Unable to logout");
    }
  };

  const openRepository = async (repo) => {
    try {
      setActionLoading(true);
      setError("");

      setSelectedRepo(repo);
      setSelectedPR(null);
      setFiles([]);

      const response = await api.get(
        `/github/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/pulls`,
      );

      setPullRequests(response.data.pullRequests);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch pull requests");
    } finally {
      setActionLoading(false);
    }
  };

  const openPullRequest = async (pr) => {
    try {
      setActionLoading(true);
      setError("");

      setSelectedPR(pr);

      const response = await api.get(
        `/github/repos/${encodeURIComponent(selectedRepo.owner.login)}/${encodeURIComponent(selectedRepo.name)}/pulls/${pr.number}/files`,
      );

      setFiles(response.data.files);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch changed files");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="animate-spin mr-3" />
        Loading PR Sentinel...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="bg-indigo-600 p-4 rounded-2xl inline-flex mb-6">
            <ShieldCheck size={35} />
          </div>

          <h1 className="text-3xl font-bold mb-3">PR Sentinel</h1>

          <p className="text-zinc-400 mb-8">
            AI-powered GitHub code review platform. Connect your GitHub account
            to get started.
          </p>

          <button
            onClick={connectGitHub}
            className="w-full bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg py-3 flex items-center justify-center gap-3"
          >
            <Github size={21} />
            Continue with GitHub
          </button>

          {error && <p className="text-red-400 text-sm mt-5">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShieldCheck size={22} />
          </div>

          <span className="font-bold text-xl">PR Sentinel</span>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt="GitHub avatar"
            className="w-9 h-9 rounded-full"
          />

          <span className="text-sm hidden sm:block">{user.username}</span>

          <button
            onClick={logout}
            className="text-zinc-400 hover:text-white"
            title="Logout"
          >
            <LogOut size={19} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>

            <p className="text-zinc-400">
              Manage your repositories and pull requests.
            </p>
          </div>

          <button
            onClick={initialize}
            className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!selectedRepo ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Repositories</h2>

              <span className="text-zinc-400 text-sm">
                {repositories.length} repositories
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {repositories.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => openRepository(repo)}
                  className="text-left bg-zinc-900 border border-zinc-800 hover:border-indigo-500 rounded-xl p-5 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Github size={19} />

                      <h3 className="font-semibold">{repo.name}</h3>
                    </div>

                    <ExternalLink size={16} className="text-zinc-500" />
                  </div>

                  <p className="text-sm text-zinc-400 line-clamp-2 min-h-10 mb-5">
                    {repo.description || "No description available"}
                  </p>

                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {repo.stars}
                    </span>

                    <span className="flex items-center gap-1">
                      <GitFork size={14} />
                      {repo.forks}
                    </span>

                    <span>{repo.language || "Unknown"}</span>
                  </div>
                </button>
              ))}
            </div>

            {repositories.length === 0 && (
              <p className="text-zinc-400 text-center py-16">
                No accessible public repositories found.
              </p>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedRepo(null);
                setSelectedPR(null);
                setFiles([]);
                setPullRequests([]);
              }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white mb-7"
            >
              <ArrowLeft size={17} />
              Back to repositories
            </button>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-7">
              <div className="flex items-center gap-3 mb-3">
                <Github size={23} />

                <h2 className="text-xl font-bold">{selectedRepo.fullName}</h2>
              </div>

              <p className="text-zinc-400 text-sm">
                {selectedRepo.description || "No description"}
              </p>
            </div>

            {!selectedPR ? (
              <>
                <h2 className="text-xl font-semibold mb-6">
                  <GitPullRequest className="inline mr-2" />
                  Open Pull Requests ({pullRequests.length})
                </h2>

                {actionLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <div className="space-y-4">
                    {pullRequests.map((pr) => (
                      <button
                        key={pr.id}
                        onClick={() => openPullRequest(pr)}
                        className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-indigo-500 rounded-xl p-5"
                      >
                        <div className="font-semibold mb-2">
                          #{pr.number} {pr.title}
                        </div>

                        <div className="text-sm text-zinc-400 flex flex-wrap gap-4">
                          <span>{pr.author.username}</span>
                          <span>
                            {pr.headBranch} → {pr.baseBranch}
                          </span>
                          <span>{pr.changedFiles} files changed</span>
                          <span className="text-emerald-400">
                            +{pr.additions}
                          </span>
                          <span className="text-red-400">-{pr.deletions}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!actionLoading && pullRequests.length === 0 && (
                  <p className="text-zinc-400 py-10">
                    No open pull requests in this repository.
                  </p>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedPR(null);
                    setFiles([]);
                  }}
                  className="text-zinc-400 hover:text-white flex items-center gap-2 mb-6"
                >
                  <ArrowLeft size={17} />
                  Back to pull requests
                </button>

                <h2 className="text-xl font-bold mb-2">
                  #{selectedPR.number} {selectedPR.title}
                </h2>

                <p className="text-zinc-400 text-sm mb-7">
                  {selectedPR.author.username} · {selectedPR.headBranch} →{" "}
                  {selectedPR.baseBranch}
                </p>

                <h3 className="font-semibold mb-4">
                  <FileCode2 className="inline mr-2" />
                  Changed Files ({files.length})
                </h3>

                {actionLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div
                        key={file.filename}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
                      >
                        <div className="flex justify-between gap-3 mb-3">
                          <span className="font-mono text-sm break-all">
                            {file.filename}
                          </span>

                          <span className="text-xs text-zinc-500">
                            {file.status}
                          </span>
                        </div>

                        <div className="flex gap-4 text-xs mb-3">
                          <span className="text-emerald-400">
                            +{file.additions}
                          </span>

                          <span className="text-red-400">
                            -{file.deletions}
                          </span>

                          <span className="text-zinc-500">
                            {file.changes} changes
                          </span>
                        </div>

                        <pre className="text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-60">
                          {file.patch || "Patch unavailable for this file"}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
