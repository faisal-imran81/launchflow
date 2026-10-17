import { test } from "node:test";
import assert from "node:assert/strict";

import { getAiErrorMessage } from "../src/utils/aiErrorMessages.js";

const FALLBACK = "fallback message";

function makeErr(status, code) {
  return { response: { status, data: code ? { code } : {} } };
}

test("returns the network message when there is no response", () => {
  const msg = getAiErrorMessage(new Error("Network Error"), FALLBACK);
  assert.ok(msg.includes("Cannot reach the server"));
});

test("returns the network message when err is undefined", () => {
  const msg = getAiErrorMessage(undefined, FALLBACK);
  assert.ok(msg.includes("Cannot reach the server"));
});

test("maps ai/rate-limited code", () => {
  const msg = getAiErrorMessage(makeErr(429, "ai/rate-limited"), FALLBACK);
  assert.ok(msg.includes("Too many requests"));
});

test("maps ai/service-unavailable code", () => {
  const msg = getAiErrorMessage(makeErr(503, "ai/service-unavailable"), FALLBACK);
  assert.ok(msg.includes("temporarily unavailable"));
});

test("maps ai/bad-gateway code", () => {
  const msg = getAiErrorMessage(makeErr(502, "ai/bad-gateway"), FALLBACK);
  assert.ok(msg.includes("provider returned an error"));
});

test("maps ai/auth-failed code even though status is 500", () => {
  const msg = getAiErrorMessage(makeErr(500, "ai/auth-failed"), FALLBACK);
  assert.ok(msg.includes("not available right now"));
});

test("maps ai/model-unavailable code even though status is 500", () => {
  const msg = getAiErrorMessage(makeErr(500, "ai/model-unavailable"), FALLBACK);
  assert.ok(msg.includes("model is currently unavailable"));
});

test("maps bad-request/invalid-json code", () => {
  const msg = getAiErrorMessage(makeErr(400, "bad-request/invalid-json"), FALLBACK);
  assert.ok(msg.includes("Invalid request data"));
});

test("falls back to the status message when the code is unknown", () => {
  const msg = getAiErrorMessage(makeErr(429, "something/else"), FALLBACK);
  assert.ok(msg.includes("Too many requests"));
});

test("falls back to the status message when there is no code", () => {
  const msg = getAiErrorMessage(makeErr(503), FALLBACK);
  assert.ok(msg.includes("temporarily unavailable"));
});

test("returns the fallback for unknown code and unknown status", () => {
  const msg = getAiErrorMessage(makeErr(422, "unknown"), FALLBACK);
  assert.equal(msg, FALLBACK);
});

test("code takes priority over status", () => {
  const msg = getAiErrorMessage(makeErr(503, "ai/rate-limited"), FALLBACK);
  assert.ok(msg.includes("Too many requests"));
});
