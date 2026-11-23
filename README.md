# PR Sentinel

AI-Powered Autonomous GitHub Code Review Platform.

## Overview

PR Sentinel is a full-stack application that uses specialized
AI agents to analyze GitHub pull requests, detect potential
bugs, identify security vulnerabilities, and suggest code fixes.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### AI Engine
- Python
- LangGraph
- LangChain
- Gemini API

## Architecture

React -> Express -> MongoDB

Express -> Python LangGraph Service

## Development

Start the application:

npm run dev

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

Health endpoint:
http://localhost:5000/api/health

API routes use the `/api/v1` prefix. Before starting the backend, configure
`MONGODB_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, GitHub OAuth credentials, and
`FRONTEND_URL` in `backend/.env`. Configure `GOOGLE_API_KEY` (and optionally
`GEMINI_MODEL`) in `ai-engine/.env`. If omitted, the AI engine uses
`gemini-3.8-flash`.

