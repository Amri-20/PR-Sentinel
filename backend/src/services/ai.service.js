import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";
// import { diff } from "util";
// import { app } from "../app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_ENGINE_DIR = path.resolve(__dirname, "../../../ai-engine");

// const PYTHON_PATH = path.join(AI_ENGINE_DIR, "venv", "Scripts", "python.exe");

const PYTHON_PATH = path.join(AI_ENGINE_DIR, ".venv", "Scripts", "python.exe");

const MAIN_SCRIPT = path.join(AI_ENGINE_DIR, "main.py");

export const runCodeReview = (filename, codeDiff) => {
  return new Promise((resolve, reject) => {
    if (!filename || !codeDiff) {
      return reject(new ApiError(400, "Filename and code diff are required"));
    }

    const python = spawn(PYTHON_PATH, [MAIN_SCRIPT], {
      cwd: AI_ENGINE_DIR,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timeout = setTimeout(() => {
      python.kill();
      finish(new ApiError(504, "AI review process timed out"));
    }, 120000);

    const finish = (error, result = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    };

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("error", (error) => {
      finish(new ApiError(500, `Failed to start python: ${error.message}`));
    });

    python.on("close", (code) => {
      if (code != 0) {
        return finish(
          new ApiError(
            500,
            stderr.trim() || `Python process exited with code ${code}`,
          ),
        );
      }

      try {
        const result = JSON.parse(stdout);

        if (result.status !== "completed") {
          return finish(
            new ApiError(500, result.error || "AI code review failed"),
          );
        }

        finish(null, result.review);
      } catch {
        finish(new ApiError(500, "Python returned an invalid JSON response"));
      }
    });

    python.stdin.on("error", (error) => {
      finish(
        new ApiError(500, `Failed to send data to python: ${error.message}`),
      );
    });

    // python.stdin.end(JSON.stringify({ filename, diff }));
    python.stdin.end(JSON.stringify({ filename, diff: codeDiff }));
  });
};
