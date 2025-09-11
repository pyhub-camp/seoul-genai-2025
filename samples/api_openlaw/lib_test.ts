import {
  buildUrl,
  getLawDetail,
  requireEnv,
  searchAdmrul,
  searchLaws,
} from "./lib.ts";

import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("buildUrl constructs query params", () => {
  const url = buildUrl("http://example.com/path", {
    a: 1,
    b: "x",
    c: true,
    d: undefined,
  });
  const u = new URL(url);
  assertEquals(u.origin + u.pathname, "http://example.com/path");
  assertEquals(u.searchParams.get("a"), "1");
  assertEquals(u.searchParams.get("b"), "x");
  assertEquals(u.searchParams.get("c"), "true");
  // d should be omitted
  assertEquals(u.searchParams.has("d"), false);
});

Deno.test("requireEnv throws when missing", () => {
  const key = "__TEST_ENV_MISSING__";
  Deno.env.delete(key);
  assertThrows(() => {
    requireEnv(key);
  });
});

Deno.test("searchLaws builds correct URL and parses JSON", async () => {
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push(url);
    return Promise.resolve(
      new Response(
        JSON.stringify({ ok: true, target: "law" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
  }) as typeof fetch;

  try {
    interface OkResponse {
      ok: boolean;
      target?: string;
    }
    const res = await searchLaws({ oc: "OC123", query: "도로교통" });
    assertEquals((res as OkResponse).ok, true);
    // validate target param exists in URL
    const u = new URL(calls[0]);
    assertEquals(u.pathname.endsWith("/lawSearch.do"), true);
    assertEquals(u.searchParams.get("target"), "law");
    assertEquals(u.searchParams.get("type"), "JSON");
    assertEquals(u.searchParams.get("OC"), "OC123");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("searchAdmrul builds correct URL and parses JSON", async () => {
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push(url);
    return Promise.resolve(
      new Response(
        JSON.stringify({ ok: true, target: "admrul" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
  }) as typeof fetch;

  try {
    interface OkResponse {
      ok: boolean;
      target?: string;
    }
    const res = await searchAdmrul({ oc: "OC123", query: "교통" });
    assertEquals((res as OkResponse).ok, true);
    const u = new URL(calls[0]);
    assertEquals(u.pathname.endsWith("/lawSearch.do"), true);
    assertEquals(u.searchParams.get("target"), "admrul");
    assertEquals(u.searchParams.get("type"), "JSON");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("getLawDetail tries ID then MST on failure", async () => {
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push(url);
    const u = new URL(url);
    if (u.searchParams.has("ID")) {
      return Promise.resolve(new Response("not found", { status: 404 }));
    }
    // MST path returns success
    return Promise.resolve(
      new Response(
        JSON.stringify({ ok: true, via: "MST" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
  }) as typeof fetch;

  try {
    interface DetailResponse {
      ok: boolean;
      via?: string;
    }
    const res = await getLawDetail({ oc: "OC123", idOrMst: "011349" });
    assertEquals((res as DetailResponse).via, "MST");
    // Ensure first attempt used ID then MST
    const first = new URL(calls[0]);
    const second = new URL(calls[1]);
    assertEquals(first.searchParams.has("ID"), true);
    assertEquals(second.searchParams.has("MST"), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
