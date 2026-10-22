import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "./worker.mjs";

const env = {
  DEPLOY_HOOK_URL:
    "https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/test-hook",
};

test("the daily refresh triggers a build with a POST request", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ success: true }),
  );

  await worker.scheduled({}, env);

  assert.equal(fetch.mock.callCount(), 1);
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, env.DEPLOY_HOOK_URL);
  assert.equal(options.method, "POST");
  assert.ok(options.signal instanceof AbortSignal);
});

test("missing configuration fails before making a request", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch");
  await assert.rejects(worker.scheduled({}, {}), /DEPLOY_HOOK_URL is required/);
  assert.equal(fetch.mock.callCount(), 0);
});

test("a rejected or unsuccessful build fails the scheduled invocation", async (context) => {
  const fetch = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 503 }),
  );
  await assert.rejects(worker.scheduled({}, env), /HTTP 503/);

  fetch.mock.mockImplementation(async () => Response.json({ success: false }));
  await assert.rejects(worker.scheduled({}, env), /did not accept/);
});

test("network errors do not expose the secret hook URL", async (context) => {
  context.mock.method(globalThis, "fetch", async () => {
    throw new Error(`Could not fetch ${env.DEPLOY_HOOK_URL}`);
  });

  await assert.rejects(worker.scheduled({}, env), (error) => {
    assert.match(error.message, /could not reach Cloudflare Builds/);
    assert.ok(!error.message.includes(env.DEPLOY_HOOK_URL));
    assert.equal(error.cause, undefined);
    return true;
  });
});
