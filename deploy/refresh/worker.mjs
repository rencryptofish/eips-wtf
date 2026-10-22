export default {
  async scheduled(_event, env) {
    if (!env.DEPLOY_HOOK_URL) {
      throw new Error("DEPLOY_HOOK_URL is required for the daily refresh.");
    }

    let response;
    try {
      response = await fetch(env.DEPLOY_HOOK_URL, {
        method: "POST",
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      // Keep the secret deploy hook URL out of error logs.
      throw new Error("The daily refresh could not reach Cloudflare Builds.");
    }

    if (!response.ok) {
      throw new Error(
        `Cloudflare rejected the daily refresh (HTTP ${response.status}).`,
      );
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error("Cloudflare Builds did not accept the daily refresh.");
    }

    console.log("Daily site rebuild requested.");
  },
};
