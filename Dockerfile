FROM node:22-bookworm-slim

WORKDIR /app

# Install Python and virtual environment support
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend and AI engine
COPY backend ./backend
COPY ai-engine ./ai-engine

# Create Python environment and install AI dependencies
RUN python3 -m venv /app/ai-engine/.venv \
    && /app/ai-engine/.venv/bin/pip install --no-cache-dir --upgrade pip \
    && /app/ai-engine/.venv/bin/pip install --no-cache-dir -r /app/ai-engine/requirements.txt

# Production configuration
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PYTHON_EXECUTABLE=/app/ai-engine/.venv/bin/python
ENV PORT=10000

WORKDIR /app/backend

EXPOSE 10000

CMD ["npm", "start"]
