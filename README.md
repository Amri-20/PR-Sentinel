# PR Sentinel

PR Sentinel is a local, full-stack GitHub pull-request review application. After a user connects a GitHub account, the application lists accessible repositories and open pull requests, retrieves changed files, and runs an AI review over each available diff. Reviews are saved per user, repository, and pull request for later retrieval.

## Implemented features

- GitHub OAuth sign-in with CSRF state validation and an HTTP-only application session cookie.
- Encrypted storage of the GitHub access token in MongoDB.
- Repository and open pull-request discovery through the GitHub REST API, including private repositories permitted by the OAuth token.
- Pull-request file and diff inspection.
- On-demand AI review of each changed file with an available patch.
- Structured findings with severity, category, affected file, optional line, description, and suggested fix.
- Per-file review outcomes: completed, skipped when GitHub does not provide a patch, or failed without abandoning reviews of other files.
- Persisted pull-request reviews and an API endpoint for repository review history.
- A dashboard that displays changed-file diffs, review progress, saved review results, severity counts, and per-file failures or skips.
- PR-specific review progress state, so the reviewing indicator applies only to the pull request being reviewed.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Axios, Lucide React |
| Backend | Node.js, Express 5, Mongoose, MongoDB, JSON Web Tokens |
| Integrations | GitHub OAuth and GitHub REST API |
| AI engine | Python, LangGraph, LangChain, Google Gemini (`langchain-google-genai`) |

## Architecture

```text
Browser
  │ React dashboard; Vite proxies /api during development
  ▼
Express API ─────────────► MongoDB
  │                         users, encrypted GitHub tokens, repositories, reviews
  ├─ GitHub OAuth / GitHub REST API
  └─ starts ai-engine/main.py for each reviewable file
       ▼
    LangGraph validation → Gemini structured review → output validation
```

The Node.js backend starts the Python engine as a child process and sends one JSON payload containing a filename and Git diff over standard input. The engine returns JSON over standard output. The backend allows up to two minutes per file and records individual file failures instead of discarding successful results from the same pull request.

## AI review workflow

1. The user chooses **Run AI Review** for an open pull request.
2. The backend fetches up to 100 changed files from GitHub for that pull request.
3. Files without a `patch` are marked as skipped because there is no diff to analyze.
4. For every reviewable file, the backend invokes `ai-engine/main.py` with its filename and patch.
5. The LangGraph workflow validates the input, asks Gemini for a structured review, and validates the returned schema.
6. Findings use `bug`, `security`, `performance`, or `quality` categories, and `critical` through `info` severities.
7. The backend stores the aggregate status (`completed`, `partial`, or `failed`) and file-level results in MongoDB.
8. The frontend presents saved results when the pull request is opened again.

## How the application works

1. Open the frontend and select **Continue with GitHub**.
2. The backend redirects to GitHub OAuth with `read:user repo` scope.
3. GitHub returns to the configured callback. The backend validates OAuth state, fetches the profile, encrypts and stores the access token, then sets a JWT session cookie.
4. The dashboard loads repositories from GitHub.
5. Select a repository, then an open pull request to load changed files and any saved review.
6. Run the AI review. The loading state is scoped to the selected pull request.
7. Review results show summaries, findings, severity totals, and skipped or failed files.

## Project structure

```text
PR-Sentinel/
├── ai-engine/
│   ├── agents/code_reviewer.py   # Gemini prompt, schema, and model invocation
│   ├── graph/                    # LangGraph state, nodes, and workflow
│   ├── main.py                   # JSON stdin/stdout engine entry point
│   └── requirements.txt
├── backend/
│   ├── src/
│   │   ├── controllers/          # OAuth, GitHub, repository, and review handlers
│   │   ├── models/               # User, repository, and review schemas
│   │   ├── routes/               # Versioned Express routes
│   │   ├── services/             # GitHub, AI process, and repository services
│   │   └── app.js, server.js
│   └── test/                     # Review-controller test cases
├── frontend/
│   └── src/                      # React pages, components, context, and API clients
├── package.json                  # Root development commands
└── README.md
```

## Prerequisites

- Node.js and npm
- Python 3 with `venv`
- A MongoDB instance reachable from the backend
- A GitHub OAuth App whose callback URL matches `GITHUB_CALLBACK_URL`
- A Google AI API key for real Gemini reviews, or mock mode for local integration checks

## Installation

From the repository root:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
python -m venv ai-engine/.venv
```

Activate the environment and install AI dependencies:

```bash
# macOS/Linux
source ai-engine/.venv/bin/activate
pip install -r ai-engine/requirements.txt
```

```powershell
# Windows PowerShell
ai-engine\.venv\Scripts\Activate.ps1
pip install -r ai-engine\requirements.txt
```

Create separate `.env` files in `backend/` and `ai-engine/`. They are ignored by Git; do not commit secrets.

## Environment variables

### Frontend

The frontend currently reads no environment variables. In development, Vite proxies `/api` to `http://localhost:5000` as configured in `frontend/vite.config.js`.

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string used at startup. |
| `GITHUB_CLIENT_ID` | Yes | Client ID for the GitHub OAuth App. |
| `GITHUB_CLIENT_SECRET` | Yes | Client secret for the GitHub OAuth App. |
| `GITHUB_CALLBACK_URL` | Yes | Exact backend callback URL registered with GitHub. |
| `JWT_SECRET` | Yes | Secret used to sign and verify the application session JWT. |
| `ENCRYPTION_KEY` | Yes | Base64-encoded key that must decode to exactly 32 bytes; used for AES-256-GCM encryption of GitHub access tokens. |
| `PORT` | No | Backend port; defaults to `5000`. |
| `FRONTEND_URL` | No | Comma-separated CORS allowlist and post-OAuth redirect URL; defaults to `http://localhost:5173`. |
| `NODE_ENV` | No | Set to `production` to mark session cookies as secure. |
| `PYTHON_EXECUTABLE` | No | Absolute path to the Python executable. The default is the platform-specific executable in `ai-engine/.venv`. |

### AI engine (`ai-engine/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_API_KEY` | Yes for real reviews | API key used by the Gemini integration. |
| `GEMINI_MODEL` | No | Gemini model name; defaults to `gemini-2.5-flash`. |
| `PR_SENTINEL_MOCK_AI` | No | Set to `true` to return a fixed mock review without initializing Gemini. |

## Running locally

Start MongoDB, configure environment files, and install dependencies first.

### Frontend and backend

```bash
npm run dev
```

This starts the frontend on `http://localhost:5173` and backend on `http://localhost:5000` by default. The health endpoint is `http://localhost:5000/api/v1/health`.

### Frontend only

```bash
npm --prefix frontend run dev
```

### Backend only

```bash
npm --prefix backend run dev
```

### AI engine directly

The backend normally starts the engine automatically. To exercise its JSON interface, activate the virtual environment and run:

```bash
echo '{"filename":"example.js","diff":"@@ -1 +1 @@\n-old\n+new"}' | python ai-engine/main.py
```

For a direct mock run, set `PR_SENTINEL_MOCK_AI=true` in `ai-engine/.env`. Real direct runs require `GOOGLE_API_KEY`.

## Testing and verification

Frontend checks available in the project:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

Run the backend tests from the project root:


node --experimental-test-module-mocks --test backend/test/*.test.js


The current test suite contains four cases covering empty pull requests, missing patches, AI failures, and multi-file review continuation.

Note: Node.js may display experimental module-mocking and deprecation warnings. These are non-fatal; all four tests currently pass.

## Current status

The application supports authenticated repository browsing, pull-request diff viewing, AI review execution, MongoDB persistence, and saved-review retrieval. The backend also exposes selected-repository and repository-review-history endpoints, but the current dashboard does not provide separate UI controls for those workflows.

The AI review path is a single structured Gemini review workflow. Multi-agent orchestration is not implemented.

## Phase 2 roadmap

The following are future improvements, not current functionality:

- Add a dashboard experience for repository review history and selected repositories.
- Make the backend test suite compatible with the project's supported Node.js version and add a package test command.
- Expand automated frontend and end-to-end coverage.
- Add production deployment configuration, operational monitoring, and deployment documentation.
- Evaluate multi-agent review orchestration as a future capability; it is not part of the current system.
