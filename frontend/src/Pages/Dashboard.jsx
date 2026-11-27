import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  FileCode2,
  GitPullRequest,
  Loader2,
  RefreshCw,
} from "lucide-react";
import ErrorMessage from "../Components/ErrorMessage";
import Github from "../Components/GithubIcon";
import RepositoryGrid from "../Components/Repository/RepositoryGrid";
import PullRequestList from "../Components/PullRequest/PullRequestList";
import CodeDiff from "../Components/Review/CodeDiff";
import Loading from "../Components/Loading";
import useAuth from "../Hooks/useAuth";
import DashboardLayout from "../Layouts/DashboardLayout";
import {
  getPullRequestFiles,
  getPullRequests,
} from "../services/pullRequestApi";
import { getRepositories } from "../services/repositoryApi";
import ReviewResults from "../Components/Review/ReviewResults";
import {
  runPullRequestReview,
  getPullRequestReview,
} from "../services/reviewApi";

function Dashboard() {
  const { user, error: authError, refreshUser, logout } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [pullRequests, setPullRequests] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [files, setFiles] = useState([]);
  const [reviewResults, setReviewResults] = useState([]);
  const [reviewLoadingPRId, setReviewLoadingPRId] = useState(null);
  const [reviewAvailable, setReviewAvailable] = useState(false);
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
      setReviewAvailable(false);

      const response = await getPullRequestFiles(selectedRepo, pullRequest);
      setFiles(response.data.files);

      try {
        const reviewResponse = await getPullRequestReview(
          selectedRepo,
          pullRequest,
        );

        setReviewResults(reviewResponse.data.review.results);
        setReviewAvailable(true);
      } catch (reviewErr) {
        if (reviewErr.response?.status !== 404) {
          throw reviewErr;
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch pull request data",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const runAIReview = async () => {
    const pullRequestId = selectedPR.id;

    try {
      setReviewLoadingPRId(pullRequestId);
      setReviewResults([]);
      setReviewAvailable(false);
      setError("");

      const response = await runPullRequestReview(selectedRepo, selectedPR);

      setReviewResults(response.data.results);
      setReviewAvailable(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete AI review");
    } finally {
      setReviewLoadingPRId((currentPRId) =>
        currentPRId === pullRequestId ? null : currentPRId,
      );
    }
  };

  const reviewLoading = reviewLoadingPRId === selectedPR?.id;

  const backToRepositories = () => {
    setSelectedRepo(null);
    setSelectedPR(null);
    setFiles([]);
    setPullRequests([]);
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-700/70 pb-7 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">Code review command center</p>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">Developer Dashboard</h1>
          <p className="text-sm text-slate-400">
            Select a repository to inspect active changes and run a targeted review.
          </p>
        </div>
        <button
          onClick={refresh}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-slate-600 bg-[#1a2025] px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-[#222b31]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      <ErrorMessage message={error || authError} />
      {!selectedRepo ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-100">Repositories</h2>
            <span className="rounded border border-slate-700 bg-[#171c20] px-2 py-1 text-xs text-slate-400">
              {repositories.length} repositories
            </span>
          </div>
          <RepositoryGrid repositories={repositories} onOpen={openRepository} />
        </>
      ) : (
        <>
          <button
            onClick={backToRepositories}
            className="focus-ring mb-5 flex items-center gap-2 rounded text-sm text-slate-400 transition-colors hover:text-cyan-200"
          >
            <ArrowLeft size={17} />
            Back to repositories
          </button>
          <div className="surface mb-7 rounded-lg p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-md border border-cyan-300/20 bg-[#18343e] p-2 text-cyan-200"><Github size={19} /></div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-100">{selectedRepo.fullName}</h2>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              {selectedRepo.description || "No description"}
            </p>
          </div>
          {!selectedPR ? (
            <>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-100">
                <GitPullRequest className="mr-2 inline h-5 w-5 text-cyan-300" />
                Open Pull Requests ({pullRequests.length})
              </h2>
              {actionLoading ? (
                <div className="py-10 text-center"><Loader2 className="mx-auto animate-spin text-cyan-300" /></div>
              ) : (
                <PullRequestList
                  pullRequests={pullRequests}
                  onOpen={openPullRequest}
                />
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedPR(null);
                  setFiles([]);
                }}
                className="focus-ring mb-5 flex items-center gap-2 rounded text-sm text-slate-400 transition-colors hover:text-cyan-200"
              >
                <ArrowLeft size={17} />
                Back to pull requests
              </button>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
                #{selectedPR.number} {selectedPR.title}
              </h2>
              <button
                onClick={runAIReview}
                disabled={reviewLoading || actionLoading}
                className="focus-ring mb-5 flex items-center gap-2 rounded-md border border-[#4c8599] bg-[#245466] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2e687b] disabled:opacity-50"
              >
                {reviewLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  "Run AI Review"
                )}
              </button>
              <p className="mb-7 border-b border-slate-700/70 pb-5 font-mono text-xs text-slate-500">
                {selectedPR.author.username} · {selectedPR.headBranch} →{" "}
                {selectedPR.baseBranch}
              </p>
              <h3 className="mb-4 font-semibold text-slate-200">
                <FileCode2 className="mr-2 inline h-5 w-5 text-cyan-300" />
                Changed Files ({files.length})
              </h3>
              {actionLoading ? (
                <div className="py-10 text-center"><Loader2 className="mx-auto animate-spin text-cyan-300" /></div>
              ) : (
                <div className="space-y-4">
                  {files.map((file) => (
                    <CodeDiff key={file.filename} file={file} />
                  ))}
                </div>
              )}
              {reviewLoading && (
                <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-sm text-cyan-100">
                  AI is reviewing your pull request...
                </div>
              )}

              {reviewAvailable && !reviewLoading && (
                <ReviewResults results={reviewResults} />
              )}
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
