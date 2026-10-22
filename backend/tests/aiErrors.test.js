import { test } from "node:test";
import assert from "node:assert/strict";

import { toAiError } from "../src/utils/aiErrors.js";

test("toAiError maps 429 to a rate limit message", () => {
  const err = toAiError({ status: 429 });
  assert.equal(err.status, 429);
  assert.equal(err.code, "ai/rate-limited");
  assert.ok(err.message.includes("rate limit"));
  assert.equal(err.isAiError, true);
});

test("toAiError maps 401 to a server-side auth failure without leaking config", () => {
  const err = toAiError({ status: 401 });
  assert.equal(err.status, 500);
  assert.equal(err.code, "ai/auth-failed");
  assert.ok(!err.message.includes("GROQ_API_KEY"));
});

test("toAiError maps 403 to a server-side auth failure", () => {
  const err = toAiError({ status: 403 });
  assert.equal(err.status, 500);
  assert.equal(err.code, "ai/auth-failed");
});

test("toAiError detects model_not_found without leaking config", () => {
  const err = toAiError({ status: 404, code: "model_not_found" });
  assert.equal(err.status, 500);
  assert.equal(err.code, "ai/model-unavailable");
  assert.ok(err.message.includes("model"));
  assert.ok(!err.message.includes("AI_MODEL"));
});

test("toAiError detects model_decommissioned", () => {
  const err = toAiError({ status: 400, code: "model_decommissioned" });
  assert.equal(err.status, 500);
  assert.equal(err.code, "ai/model-unavailable");
  assert.ok(err.message.includes("model"));
});

test("toAiError reads the code from a nested error object", () => {
  const err = toAiError({ status: 404, error: { code: "model_not_found" } });
  assert.equal(err.status, 500);
  assert.equal(err.code, "ai/model-unavailable");
  assert.ok(err.message.includes("model"));
});

test("toAiError maps a missing status to 503 (network problem)", () => {
  const err = toAiError(new Error("getaddrinfo ENOTFOUND api.groq.com"));
  assert.equal(err.status, 503);
  assert.equal(err.code, "ai/service-unavailable");
});

test("toAiError maps unknown statuses to 502", () => {
  const err = toAiError({ status: 500 });
  assert.equal(err.status, 502);
  assert.equal(err.code, "ai/bad-gateway");
});

test("toAiError does not leak the raw provider message", () => {
  const err = toAiError({
    status: 400,
    message: '400 {"error":{"message":"secret internal detail"}}',
  });
  assert.ok(!err.message.includes("secret internal detail"));
});

test("toAiError never reuses the provider code as the client code", () => {
  const err = toAiError({ status: 400, code: "some_provider_code" });
  assert.equal(err.code, "ai/bad-gateway");
});

test("toAiError returns an existing AI error unchanged", () => {
  const original = new Error("already clean");
  original.status = 502;
  original.isAiError = true;
  assert.equal(toAiError(original), original);
});

test("toAiError maps AbortError to ai/timeout", () => {
  const abort = new Error("The operation was aborted");
  abort.name = "AbortError";
  const err = toAiError(abort);
  assert.equal(err.status, 504);
  assert.equal(err.code, "ai/timeout");
  assert.ok(err.message.toLowerCase().includes("timed out"));
  assert.equal(err.isAiError, true);
});

test("toAiError maps ERR_CANCELED to ai/timeout", () => {
  const canceled = new Error("Request canceled");
  canceled.code = "ERR_CANCELED";
  const err = toAiError(canceled);
  assert.equal(err.status, 504);
  assert.equal(err.code, "ai/timeout");
  assert.equal(err.isAiError, true);
});
