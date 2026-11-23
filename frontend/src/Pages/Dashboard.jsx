import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, FileCode2, GitPullRequest, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import ErrorMessage from "../Components/ErrorMessage";
import Github from "../Components/GithubIcon";
import RepositoryGrid from "../Components/Repository/RepositoryGrid";
import PullRequestList from "../Components/PullRequest/PullRequestList";
import CodeDiff from "../Components/Review/CodeDiff";
import Loading from "../Components/Loading";
import useAuth from "../Hooks/useAuth";
import DashboardLayout from "../Layouts/DashboardLayout";
import { getPullRequestFiles, getPullRequests, reviewPullRequest } from "../services/pullRequestApi";
import { getRepositories } from "../services/repositoryApi";

function Dashboard() {
  const { user, error: authError, refreshUser, logout } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [pullRequests, setPullRequests] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [files, setFiles] = useState([]);
  const [reviewResults, setReviewResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRepositories = useCallback(async () => {
    const response = await getRepositories();
    setRepositories(response.data.repositories);
  }, []);

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setError("");
        await fetchRepositories();
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadRepositories();
  }, [fetchRepositories]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    const refreshedUser = await refreshUser();
    if (refreshedUser) {
      try {
        await fetchRepositories();
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard");
      }
    }
    setLoading(false);
  };

  const openRepository = async (repository) => {
    try {
      setActionLoading(true);
      setError("");
      setSelectedRepo(repository);
      setSelectedPR(null);
      setFiles([]);
      setReviewResults([]);
      const response = await getPullRequests(repository);
      setPullRequests(response.data.pullRequests);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch pull requests");
    } finally {
      setActionLoading(false);
    }
  };

  const openPullRequest = async (pullRequest) => {
    try {
      setActionLoading(true);
      setError("");
      setSelectedPR(pullRequest);
      setReviewResults([]);
      const response = await getPullRequestFiles(selectedRepo, pullRequest);
      setFiles(response.data.files);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch changed files");
    } finally {
      setActionLoading(false);
    }
  };

  const runReview = async () => {
    try {
      setActionLoading(true);
      setError("");
      const response = await reviewPullRequest(selectedRepo, selectedPR);
      setReviewResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete the AI review");
    } finally {
      setActionLoading(false);
    }
  };

  const backToRepositories = () => {
    setSelectedRepo(null);
    setSelectedPR(null);
    setFiles([]);
    setPullRequests([]);
    setReviewResults([]);
  };

  if (loading) return <Loading />;

  return <DashboardLayout user={user} onLogout={logout}>
    <div className="flex justify-between items-start mb-8"><div><h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1><p className="text-zinc-400">Manage your repositories and pull requests.</p></div><button onClick={refresh} className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg"><RefreshCw size={16} />Refresh</button></div>
    <ErrorMessage message={error || authError} />
    {!selectedRepo ? <><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold">Your Repositories</h2><span className="text-zinc-400 text-sm">{repositories.length} repositories</span></div><RepositoryGrid repositories={repositories} onOpen={openRepository} /></> : <>
      <button onClick={backToRepositories} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-7"><ArrowLeft size={17} />Back to repositories</button>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-7"><div className="flex items-center gap-3 mb-3"><Github size={23} /><h2 className="text-xl font-bold">{selectedRepo.fullName}</h2></div><p className="text-zinc-400 text-sm">{selectedRepo.description || "No description"}</p></div>
      {!selectedPR ? <><h2 className="text-xl font-semibold mb-6"><GitPullRequest className="inline mr-2" />Open Pull Requests ({pullRequests.length})</h2>{actionLoading ? <Loader2 className="animate-spin" /> : <PullRequestList pullRequests={pullRequests} onOpen={openPullRequest} />}</> : <>
        <button onClick={() => { setSelectedPR(null); setFiles([]); setReviewResults([]); }} className="text-zinc-400 hover:text-white flex items-center gap-2 mb-6"><ArrowLeft size={17} />Back to pull requests</button>
        <h2 className="text-xl font-bold mb-2">#{selectedPR.number} {selectedPR.title}</h2><div className="flex flex-wrap items-center justify-between gap-4 mb-7"><p className="text-zinc-400 text-sm">{selectedPR.author.username} · {selectedPR.headBranch} → {selectedPR.baseBranch}</p><button onClick={runReview} disabled={actionLoading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold rounded-lg px-4 py-2 flex items-center gap-2"><ShieldCheck size={17} />Run AI review</button></div>{actionLoading ? <Loader2 className="animate-spin" /> : <>{reviewResults.length > 0 && <div className="space-y-4 mb-8"><h3 className="font-semibold">AI Review Results</h3>{reviewResults.map((result) => <div key={result.filename} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"><p className="font-mono text-sm mb-2">{result.filename}</p>{result.status === "skipped" ? <p className="text-zinc-400 text-sm">{result.reason}</p> : <><p className="text-zinc-400 text-sm mb-3">{result.review.summary}</p>{result.review.findings.length ? <ul className="space-y-3">{result.review.findings.map((finding, index) => <li key={`${finding.file}-${finding.line}-${finding.title}-${index}`} className="text-sm border-l-2 border-amber-400 pl-3"><div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400 mb-1"><span className="font-semibold uppercase text-amber-300">{finding.severity}</span><span>{finding.category}</span><span className="font-mono">{finding.file}{finding.line ? `:${finding.line}` : ""}</span></div><span className="font-semibold">{finding.title}</span><p className="text-zinc-400 mt-1">{finding.description}</p><p className="text-indigo-300 mt-1">Fix: {finding.suggested_fix}</p></li>)}</ul> : <p className="text-emerald-400 text-sm">No issues found.</p>}</>}</div>)}</div>}<h3 className="font-semibold mb-4"><FileCode2 className="inline mr-2" />Changed Files ({files.length})</h3><div className="space-y-4">{files.map((file) => <CodeDiff key={file.filename} file={file} />)}</div></>}
      </>}
    </>}
  </DashboardLayout>;
}

export default Dashboard;
