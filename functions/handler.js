export const intents = [
  "desarrollo",
  "sap",
  "operaciones",
  "analisis",
  "creativo",
];
/** Dependencies are injected to test auth and quota failures without calling a paid provider. */
export function createIntentHandler({
  origin,
  verifyToken,
  getUser,
  reserveQuota,
  classify,
}) {
  return async (req, res) => {
    if (req.headers.origin !== origin) {
      res.status(403).json({ error: "Origin denied" });
      return;
    }
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Cache-Control", "no-store");
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.status(204).end();
      return;
    }
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    let uid;
    try {
      ({ uid } = await verifyToken(token));
    } catch {
      res.status(401).json({ error: "Invalid session" });
      return;
    }
    if (
      typeof req.body?.goal !== "string" ||
      !req.body.goal.trim() ||
      req.body.goal.length > 4000
    ) {
      res.status(400).json({ error: "Invalid goal" });
      return;
    }
    try {
      const account = await getUser(uid);
      if (!account.emailVerified) {
        res.status(403).json({ error: "Verified email required" });
        return;
      }
      await reserveQuota(uid);
      const result = await classify(req.body.goal);
      if (!intents.includes(result.intent)) throw Error("INVALID_RESPONSE");
      res.json({ intent: result.intent });
    } catch (e) {
      res.status(e.message === "RATE_LIMIT" ? 429 : 503).json({
        error:
          e.message === "RATE_LIMIT"
            ? "Daily or per-request limit reached"
            : "Model unavailable; use local rules",
      });
    }
  };
}
