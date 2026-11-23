
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_ENGINE_DIR = path.resolve(__dirname, "../../../ai-engine");

const defaultPythonPath = process.platform === "win32"
  ? path.join(AI_ENGINE_DIR, ".venv", "Scripts", "python.exe")
  : path.join(AI_ENGINE_DIR, ".venv", "bin", "python");

const PYTHON_PATH = process.env.PYTHON_EXECUTABLE || defaultPythonPath;

const MAIN_SCRIPT = path.join(AI_ENGINE_DIR, "main.py");

export const runCodeReview = (filename, codeDiff) => {
  return new Promise((resolve, reject) => {
    if (!filename || !codeDiff) {
      return reject(new ApiError(400, "Filename and code diff are required"));
    }

    let python;
    try {
      python = spawn(PYTHON_PATH, [MAIN_SCRIPT], {
        cwd: AI_ENGINE_DIR,
        windowsHide: true,
      });
    } catch (error) {
      reject(new ApiError(500, `Failed to start Python: ${error.message}`));
      return;
    }

    let stdout = "";
    let stderr = "";
    let settled = false;
    const maxOutputBytes = 5 * 1024 * 1024;

    const timeout = setTimeout(() => {
      python.kill();
      finish(new ApiError(504, "AI review process timed out"));
    }, 120000);

    const finish = (error, result = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error) reject(error);
      else resolve(result);
    };

    python.stdout.on("data", (data) => {
      stdout += data.toString();
      if (Buffer.byteLength(stdout) > maxOutputBytes) {
        python.kill();
        finish(new ApiError(500, "AI review process returned too much output"));
      }
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("error", (error) => {
      finish(new ApiError(500, `Failed to start python: ${error.message}`));
    });

    python.on("close", (code, signal) => {
      try {
        const result = JSON.parse(stdout);

        if (result.status !== "completed") {
          return finish(
            new ApiError(500, result.error || "AI code review failed"),
          );
        }

        finish(null, result.review);
      } catch {
        finish(
          new ApiError(
            500,
            stderr.trim() ||
              `Python process exited ${signal ? `after ${signal}` : `with code ${code}`}`,
          ),
        );
      }
    });

    python.stdin.on("error", (error) => {
      finish(
        new ApiError(500, `Failed to send data to python: ${error.message}`),
      );
    });

    python.stdin.end(JSON.stringify({ filename, diff: codeDiff }));
  });
};
