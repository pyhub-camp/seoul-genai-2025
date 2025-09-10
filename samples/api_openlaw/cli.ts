#!/usr/bin/env -S deno run -A

// OpenLaw Deno CLI
// Usage:
// deno run -A samples/api_openlaw/cli.ts <law|admrul> (--query <q> | --id <id>) [--verbose] [--output <file>] [--env-path <file>]

type Kind = "law" | "admrul";

type Options = {
  kind: Kind;
  query?: string;
  id?: string;
  verbose: boolean;
  output?: string;
  envPath?: string;
};

function printUsageAndExit(msg?: string): never {
  if (msg) console.error(msg);
  console.error(
    "\nUsage: deno run -A samples/api_openlaw/cli.ts <law|admrul> (--query <q> | --id <id>) [--verbose] [--output <file>] [--env-path <file>]\n",
  );
  Deno.exit(1);
}

function parseArgs(argv: string[]): Options {
  const args = [...argv];
  const kindArg = args.shift();
  if (!kindArg) printUsageAndExit("kind 위치 인자가 필요합니다 (law|admrul)");
  const kind = kindArg as Kind;
  if (kind !== "law" && kind !== "admrul") {
    printUsageAndExit("kind는 law 또는 admrul 이어야 합니다");
  }

  let query: string | undefined;
  let id: string | undefined;
  let verbose = false;
  let output: string | undefined;
  let envPath: string | undefined;

  while (args.length) {
    const a = args.shift()!;
    switch (a) {
      case "--query":
        query = args.shift();
        if (!query) printUsageAndExit("--query 에 검색어가 필요합니다");
        break;
      case "--id":
        id = args.shift();
        if (!id) printUsageAndExit("--id 에 ID가 필요합니다");
        break;
      case "--verbose":
        verbose = true;
        break;
      case "--output":
        output = args.shift();
        if (!output) printUsageAndExit("--output 에 파일 경로가 필요합니다");
        break;
      case "--env-path":
        envPath = args.shift();
        if (!envPath) printUsageAndExit("--env-path 에 파일 경로가 필요합니다");
        break;
      case "-h":
      case "--help":
        printUsageAndExit();
        break;
      default:
        printUsageAndExit(`알 수 없는 인자: ${a}`);
    }
  }

  if ((query ? 1 : 0) + (id ? 1 : 0) !== 1) {
    printUsageAndExit("--query 또는 --id 중 하나만 지정하세요");
  }

  return { kind, query, id, verbose, output, envPath };
}

async function findRepoRoot(startDir: string): Promise<string> {
  // 상위로 올라가며 .git 또는 .env.example 존재 확인
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.name === ".git" && entry.isDirectory) return dir;
        if (entry.name === ".env" && entry.isFile) return dir;
        if (entry.name === ".env.example" && entry.isFile) return dir;
      }
    } catch (_) {
      // ignore
    }
    const parent = new URL("..", new URL("file://" + (dir.endsWith("/") ? dir : dir + "/"))).pathname;
    if (parent === dir) break;
    dir = parent;
  }
  return startDir; // fallback
}

async function readEnvFile(path: string): Promise<Record<string, string>> {
  const content = await Deno.readTextFile(path);
  const map: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    // strip optional quotes
    const val = raw.replace(/^['"]|['"]$/g, "");
    if (key) map[key] = val;
  }
  return map;
}

async function loadConfig(envPath?: string, verbose = false): Promise<{
  envs: Record<string, string>;
  loaded: string[];
}> {
  const loaded: string[] = [];
  const envs: Record<string, string> = {};
  const cwd = Deno.cwd();
  const root = await findRepoRoot(cwd);
  const rootEnv = `${root.replace(/\/$/, "")}/.env`;
  try {
    const st = await Deno.stat(rootEnv);
    if (st.isFile) {
      Object.assign(envs, await readEnvFile(rootEnv));
      loaded.push(await Deno.realPath(rootEnv));
    }
  } catch (_) {
    // no root .env
  }
  if (envPath) {
    Object.assign(envs, await readEnvFile(envPath));
    loaded.push(await Deno.realPath(envPath));
  }
  if (verbose && loaded.length === 0) {
    console.error("경고: .env 파일을 찾지 못했습니다(기본/추가 모두).\n" +
      `현재 작업경로: ${cwd}`);
  }
  return { envs, loaded };
}

function ensureOC(envs: Record<string, string>): string {
  const oc = envs["OPEN_LAW_OC"]?.trim();
  if (!oc || oc.toLowerCase() === "test" || oc === "your_api_key_here") {
    throw new Error(
      "환경변수 OPEN_LAW_OC 가 유효하지 않습니다. .env 설정을 확인하세요.",
    );
  }
  return oc;
}

function buildListUrl(kind: Kind, oc: string, query: string): string {
  const base = "https://www.law.go.kr/DRF/lawSearch.do";
  const params = new URLSearchParams({
    OC: oc,
    target: kind,
    type: "JSON",
    query,
  });
  return `${base}?${params.toString()}`;
}

function buildDetailUrl(kind: Kind, oc: string, id: string): string {
  const base = "https://www.law.go.kr/DRF/lawService.do";
  const params = new URLSearchParams({
    OC: oc,
    target: kind,
    type: "JSON",
    ID: id,
  });
  return `${base}?${params.toString()}`;
}

async function fetchJson(url: string, verbose = false, timeoutMs = 15000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    verbose && console.error(`[HTTP] GET ${url}`);
    const res = await fetch(url, { signal: ctrl.signal });
    const text = await res.text();
    verbose && console.error(`[HTTP] status=${res.status} length=${text.length}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`JSON 파싱 실패: ${(e as Error).message}. 원문 일부: ${text.slice(0, 300)}`);
    }
    if (text.trim().length === 0) {
      throw new Error("응답 본문이 비어 있습니다.");
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  try {
    const args = parseArgs(Deno.args);
    const { envs, loaded } = await loadConfig(args.envPath, args.verbose);
    if (args.verbose) {
      if (loaded.length) {
        console.error(`.env 로드 경로: ${loaded.join(", ")}`);
      }
    }
    const oc = ensureOC(envs);

    let url: string;
    if (args.query) {
      url = buildListUrl(args.kind, oc, args.query);
    } else if (args.id) {
      url = buildDetailUrl(args.kind, oc, args.id);
    } else {
      // parseArgs에서 이미 보장되지만 TS 만족용
      printUsageAndExit("--query 또는 --id 가 필요합니다");
      return;
    }

    const json = await fetchJson(url, args.verbose);
    const pretty = JSON.stringify(json, null, 2);

    if (args.output) {
      // ensure dir exists
      const outPath = args.output;
      const dir = outPath.replace(/\/[^/]*$/, "");
      if (dir && dir !== outPath) {
        await Deno.mkdir(dir, { recursive: true }).catch(() => {});
      }
      await Deno.writeTextFile(outPath, pretty);
      if (args.verbose) console.error(`결과를 파일로 저장: ${await Deno.realPath(outPath)}`);
    } else {
      console.log(pretty);
    }
  } catch (err) {
    console.error((err as Error).message ?? String(err));
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}

