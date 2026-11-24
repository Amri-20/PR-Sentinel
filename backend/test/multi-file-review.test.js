import { test, mock } from "node:test";
import assert from "node:assert/strict";
import Review from "../src/models/review.model.js";

let aiCalls = 0;

mock.module("../src/services/github.services.js", {
  namedExports: {
    getGitHubClient: async () => async () => [
      {
        filename: "broken.js",
        status: "modified",
        patch: "@@ -1 +1 @@\n-old code\n+new code",
      },
      {
        filename: "secure.js",
        status: "modified",
        patch: "@@ -1 +1 @@\n-old code\n+new code",
      },
    ],
  },
});

mock.module("../src/services/ai.service.js", {
  namedExports: {
    runCodeReview: async () => {
      aiCalls++;

      if (aiCalls === 1) {
        throw new Error("Gemini API quota exceeded");
      }

      return {
        summary: "No issues found",
        findings: [],
      };
    },
  },
});

const { reviewPullRequest } = await import(
  "../src/controllers/review.controller.js"
);

let savedReview;

Review.findOneAndUpdate = async (filter, update) => {
  savedReview = update.$set;
  return { _id: "test-review-id" };
};

test("should continue reviewing remaining files after one file fails", async () => {
  let statusCode;
  let responseBody;
  let nextError;

  const req = {
    params: {
      owner: "Amri-20",
      repo: "PR-Sentinel",
      number: "1",
    },
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

  await reviewPullRequest(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(statusCode, 200);
  assert.equal(responseBody.success, true);
  assert.equal(responseBody.count, 2);

  assert.equal(responseBody.results[0].filename, "broken.js");
  assert.equal(responseBody.results[0].status, "failed");
  assert.equal(
    responseBody.results[0].reason,
    "Gemini API quota exceeded"
  );

  assert.equal(responseBody.results[1].filename, "secure.js");
  assert.equal(responseBody.results[1].status, "completed");

  assert.equal(aiCalls, 2);
  assert.equal(responseBody.status, "partial");
  assert.equal(savedReview.status, "partial");
  assert.equal(savedReview.results.length, 2);
});