// OpenLaw API helper library (Deno)
// - Loads env (.env)
// - Builds URLs and fetches JSON
// - Provides high-level functions used by the CLI

import { parse as parseDotEnv } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

export type EnvLoadOptions = {
  envPath?: string;
  verbose?: boolean;
};

export type FetchOptions = {
  verbose?: boolean;
};

export const OPEN_LAW_BASE = "http://www.law.go.kr/DRF";

export function logVerbose(verbose: boolean | undefined, ...args: unknown[]) {
  if (verbose) console.error(...args);
}

export async function loadEnv(
  opts: EnvLoadOptions = {},
): Promise<{ path: string; loaded: boolean }> {
  const cwd = Deno.cwd();
  const envPath = opts.envPath ? opts.envPath : join(cwd, ".env");
  try {
    const content = await Deno.readTextFile(envPath);
    const parsed = parseDotEnv(content);
    for (const [k, v] of Object.entries(parsed)) {
      // Do not override if already set in process env
      if (Deno.env.get(k) === undefined) {
        Deno.env.set(k, v);
      }
    }
    logVerbose(opts.verbose, `[env] loaded`, envPath);
    return { path: envPath, loaded: true };
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      logVerbose(opts.verbose, `[env] not found`, envPath);
      return { path: envPath, loaded: false };
    }
    throw err;
  }
}

export function requireEnv(key: string): string {
  const v = Deno.env.get(key);
  if (!v || v.trim() === "") {
    throw new Error(
      `환경변수 ${key} 가 설정되지 않았습니다. .env 또는 환경변수를 확인해 주세요.`,
    );
  }
  return v;
}

export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function fetchJson(
  url: string,
  opts: FetchOptions = {},
): Promise<unknown> {
  logVerbose(opts.verbose, `[fetch]`, url);
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `요청 실패: ${res.status} ${res.statusText}\nURL: ${url}\n본문: ${
        text.slice(0, 500)
      }`,
    );
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("json") && !ct.includes("application/javascript")) {
    // 일부 응답이 content-type이 부정확할 수 있으니, JSON 파싱 시도
  }
  try {
    const data = await res.json();
    return data;
  } catch (e) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `JSON 파싱 실패: ${String(e)}\nURL: ${url}\n본문: ${text.slice(0, 500)}`,
    );
  }
}

export async function searchLaws(
  params: {
    oc: string;
    query: string;
    display?: number;
    page?: number;
    verbose?: boolean;
  },
): Promise<unknown> {
  const url = buildUrl(`${OPEN_LAW_BASE}/lawSearch.do`, {
    OC: params.oc,
    target: "law",
    type: "JSON",
    query: params.query,
    display: params.display,
    page: params.page,
  });
  return await fetchJson(url, { verbose: params.verbose });
}

export async function getLawDetail(
  params: { oc: string; idOrMst: string; verbose?: boolean },
): Promise<unknown> {
  const base = `${OPEN_LAW_BASE}/lawService.do`;
  const first = buildUrl(base, {
    OC: params.oc,
    target: "law",
    type: "JSON",
    ID: params.idOrMst,
  });
  try {
    return await fetchJson(first, { verbose: params.verbose });
  } catch (e) {
    logVerbose(
      params.verbose,
      `[detail:id] 실패, MST로 재시도`,
      String(e).slice(0, 200),
    );
    const second = buildUrl(base, {
      OC: params.oc,
      target: "law",
      type: "JSON",
      MST: params.idOrMst,
    });
    return await fetchJson(second, { verbose: params.verbose });
  }
}

export async function searchAdmrul(
  params: {
    oc: string;
    query: string;
    display?: number;
    page?: number;
    verbose?: boolean;
  },
): Promise<unknown> {
  const url = buildUrl(`${OPEN_LAW_BASE}/lawSearch.do`, {
    OC: params.oc,
    target: "admrul",
    type: "JSON",
    query: params.query,
    display: params.display,
    page: params.page,
  });
  return await fetchJson(url, { verbose: params.verbose });
}

export async function writeOutput(
  json: unknown,
  outputPath: string,
): Promise<void> {
  const text = JSON.stringify(json, null, 2);
  await Deno.writeTextFile(outputPath, text);
}
