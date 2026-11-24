
import { test, mock } from "node:test";
import assert from "node:assert/strict";

let aiCalled = false;

mock.module("../src/services/github.services.js", {
  namedExports: {
    getGitHubClient: async () => async () => [],
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

test("should reject a pull request with no changed files", async () => {
  let statusCode;
  let responseBody;

  const req = {
    params: {
      owner: "Amri-20",
      repo: "PR-Sentinel",
      number: "1",
    },
    userId: "test-user",
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
  assert.equal(statusCode, 400);
  assert.equal(responseBody.success, false);
  assert.equal(
    responseBody.message,
    "No changed files found in this pull request"
  );
  assert.equal(aiCalled, false);
});
