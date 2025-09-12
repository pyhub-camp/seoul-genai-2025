// Supabase Edge Function: api_openlaw
// - GET only; inputs via query parameters
// - Anonymous access; no Authorization header handling
// - Large body (law.detail) stored in Storage and returns a signed URL

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import type { HeadersInit } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPEN_LAW_BASE = "http://www.law.go.kr/DRF";
const CACHE_BUCKET = "caches-bucket";

type Json = unknown;

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

function jsonResponse(body: Json, init: number | ResponseInit = 200): Response {
  const status = typeof init === "number" ? init : (init.status ?? 200);
  const headers: Headers = new Headers(typeof init === "number" ? {} : (init.headers ?? {}));
  headers.set("Content-Type", "application/json; charset=utf-8");
  for (const [k, v] of Object.entries(corsHeaders())) headers.set(k, String(v));
  return new Response(JSON.stringify(body), { status, headers });
}

function errorResponse(message: string, status = 400, extra?: Record<string, unknown>): Response {
  return jsonResponse({ error: message, ...extra }, status);
}

function buildUrl(base: string, params: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function fetchJson(url: string): Promise<Json> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`요청 실패: ${res.status} ${res.statusText}\nURL: ${url}\n본문: ${text.slice(0, 500)}`);
  }
  try {
    return await res.json();
  } catch (e) {
    const text = await res.text().catch(() => "");
    throw new Error(`JSON 파싱 실패: ${String(e)}\nURL: ${url}\n본문: ${text.slice(0, 500)}`);
  }
}

async function searchLaws(params: { oc: string; query: string; display?: number; page?: number; }): Promise<Json> {
  const url = buildUrl(`${OPEN_LAW_BASE}/lawSearch.do`, {
    OC: params.oc,
    target: "law",
    type: "JSON",
    query: params.query,
    display: params.display,
    page: params.page,
  });
  return await fetchJson(url);
}

async function getLawDetail(params: { oc: string; idOrMst: string; }): Promise<Json> {
  const base = `${OPEN_LAW_BASE}/lawService.do`;
  const first = buildUrl(base, { OC: params.oc, target: "law", type: "JSON", ID: params.idOrMst });
  try {
    return await fetchJson(first);
  } catch (_e) {
    const second = buildUrl(base, { OC: params.oc, target: "law", type: "JSON", MST: params.idOrMst });
    return await fetchJson(second);
  }
}

async function searchAdmrul(params: { oc: string; query: string; display?: number; page?: number; }): Promise<Json> {
  const url = buildUrl(`${OPEN_LAW_BASE}/lawSearch.do`, {
    OC: params.oc,
    target: "admrul",
    type: "JSON",
    query: params.query,
    display: params.display,
    page: params.page,
  });
  return await fetchJson(url);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getEnv(key: string): string | undefined {
  try {
    return Deno.env.get(key);
  } catch {
    return undefined;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders() } });
  }

  if (req.method !== "GET") {
    return errorResponse("GET 메서드만 지원합니다.", 405);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "";

  const oc = getEnv("OPEN_LAW_OC");
  if (!oc) {
    return errorResponse("환경변수 OPEN_LAW_OC 가 설정되어 있지 않습니다.", 500);
  }

  try {
    switch (action) {
      case "law.search": {
        const query = url.searchParams.get("query");
        if (!query) return errorResponse("query 파라미터가 필요합니다.");
        const display = url.searchParams.get("display");
        const page = url.searchParams.get("page");
        const data = await searchLaws({ oc, query, display: display ? Number(display) : undefined, page: page ? Number(page) : undefined });
        return jsonResponse(data, 200);
      }
      case "law.detail": {
        const idOrMst = url.searchParams.get("idOrMst");
        if (!idOrMst) return errorResponse("idOrMst 파라미터가 필요합니다.");

        const data = await getLawDetail({ oc, idOrMst });

        const SUPABASE_URL = getEnv("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
          return errorResponse("Storage 업로드를 위해 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.", 500);
        }
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const keyRoot = "law_detail";
        const hash = await sha256Hex(JSON.stringify({ action, idOrMst }));
        const objectPath = `${keyRoot}/${hash}.json`;
        const jsonText = JSON.stringify(data);

        // Upload (upsert)
        const uploadRes = await supabase.storage.from(CACHE_BUCKET).upload(objectPath, new TextEncoder().encode(jsonText), {
          contentType: "application/json; charset=utf-8",
          upsert: true,
        });
        if (uploadRes.error) {
          return errorResponse("Storage 업로드 실패", 500, { details: uploadRes.error.message });
        }

        // Signed URL (1 hour)
        const signed = await supabase.storage.from(CACHE_BUCKET).createSignedUrl(objectPath, 60 * 60);
        if (signed.error || !signed.data?.signedUrl) {
          return errorResponse("서명 URL 생성 실패", 500, { details: signed.error?.message });
        }
        return jsonResponse({ url: signed.data.signedUrl }, 200);
      }
      case "admrul.search": {
        const query = url.searchParams.get("query");
        if (!query) return errorResponse("query 파라미터가 필요합니다.");
        const display = url.searchParams.get("display");
        const page = url.searchParams.get("page");
        const data = await searchAdmrul({ oc, query, display: display ? Number(display) : undefined, page: page ? Number(page) : undefined });
        return jsonResponse(data, 200);
      }
      default:
        return errorResponse("지원하지 않는 action 입니다. (law.search | law.detail | admrul.search)", 400);
    }
  } catch (e) {
    return errorResponse("요청 처리 중 오류가 발생했습니다.", 500, { message: String(e) });
  }
});

