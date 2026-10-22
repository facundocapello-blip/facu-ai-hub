import { it, expect, vi } from "vitest";
import { createIntentHandler } from "../functions/handler.js";
function setup(overrides: Record<string, unknown> = {}) {
  const classify = vi.fn(async () => ({ intent: "sap" }));
  const reserveQuota = vi.fn(async () => {});
  const handler = createIntentHandler({
    origin: "https://hub.example",
    verifyToken: async () => ({ uid: "alice" }),
    getUser: async () => ({ emailVerified: true }),
    reserveQuota,
    classify,
    ...overrides,
  });
  const req = {
    method: "POST",
    headers: { origin: "https://hub.example", authorization: "Bearer token" },
    body: { goal: "Revisar PT60" },
  };
  const res = {
    code: 200,
    data: null as unknown,
    status(n: number) {
      this.code = n;
      return this;
    },
    set: vi.fn(),
    json(d: unknown) {
      this.data = d;
      return this;
    },
    end: vi.fn(),
  };
  return { handler, req, res, classify, reserveQuota };
}
it("rejects foreign origins before calling the model", async () => {
  const x = setup();
  x.req.headers.origin = "https://other.example";
  await x.handler(x.req, x.res);
  expect(x.res.code).toBe(403);
  expect(x.classify).not.toHaveBeenCalled();
});
it("requires valid authentication and verified email", async () => {
  const a = setup({
    verifyToken: async () => {
      throw Error("bad");
    },
  });
  await a.handler(a.req, a.res);
  expect(a.res.code).toBe(401);
  expect(a.classify).not.toHaveBeenCalled();
  const b = setup({ getUser: async () => ({ emailVerified: false }) });
  await b.handler(b.req, b.res);
  expect(b.res.code).toBe(403);
  expect(b.classify).not.toHaveBeenCalled();
});
it("rejects oversized goals before spending quota", async () => {
  const x = setup();
  x.req.body.goal = "a".repeat(4001);
  await x.handler(x.req, x.res);
  expect(x.res.code).toBe(400);
  expect(x.reserveQuota).not.toHaveBeenCalled();
});
it("enforces quota before calling the provider", async () => {
  const x = setup({
    reserveQuota: async () => {
      throw Error("RATE_LIMIT");
    },
  });
  await x.handler(x.req, x.res);
  expect(x.res.code).toBe(429);
  expect(x.classify).not.toHaveBeenCalled();
});
it("accepts a constrained intent and discards extra output", async () => {
  const x = setup({
    classify: async () => ({ intent: "sap", command: "delete everything" }),
  });
  await x.handler(x.req, x.res);
  expect(x.res.data).toEqual({ intent: "sap" });
});
it("rejects malformed provider responses without leaking details", async () => {
  const x = setup({
    classify: async () => ({ intent: "run arbitrary command" }),
  });
  await x.handler(x.req, x.res);
  expect(x.res.code).toBe(503);
  expect(JSON.stringify(x.res.data)).not.toContain("arbitrary");
});
