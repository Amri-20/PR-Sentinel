import { test, mock } from "node:test";
import assert from "node:assert/strict";
import Review from "../src/models/review.model.js";

let aiCalled = false;

mock.module("../src/services/github.services.js", {
  namedExports: {
    getGitHubClient: async () => async () => [
      {
        filename: "large-file.js",
        status: "modified",
        additions: 100,
        deletions: 20,
      },
    ],
  },
});

mock.module("../src/services/ai.service.js", {
  namedExports: {
    runCodeReview: async () => {
      aiCalled = true;
      return {};
    },
  },
});

const { reviewPullRequest } = await import(
  "../src/controllers/review.controller.js"
);

Review.findOneAndUpdate = async () => ({
  _id: "test-review-id",
});

test("should skip files without patches", async () => {
  let statusCode;
  let responseBody;

  const req = {
    params: {
      owner: "Amri-20",
      repo: "PR-Sentinel",
      number: "1",
    },
    // userId: "test-user",
    userId: "507f1f77bcf86cd799439011",
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseBody = data;
      return this;
    },
  };

  let nextError;

  await reviewPullRequest(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(statusCode, 200);
  assert.equal(responseBody.success, true);
  assert.equal(responseBody.count, 1);
  assert.equal(responseBody.results[0].status, "skipped");
  assert.equal(
    responseBody.results[0].reason,
    "Diff patch is unavailable"
  );
  assert.equal(aiCalled, false);
});
