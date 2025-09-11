// OpenLaw CLI (Deno)
// Usage examples:
//   deno run -A samples/api_openlaw/cli.ts law --query 도로교통
//   deno run -A samples/api_openlaw/cli.ts law --id 011349 --verbose
//   deno run -A samples/api_openlaw/cli.ts admrul --query 교통 --output tmp/out.json

import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { dirname } from "https://deno.land/std@0.224.0/path/mod.ts";

import {
  getLawDetail,
  loadEnv,
  logVerbose,
  requireEnv,
  searchAdmrul,
  searchLaws,
  writeOutput,
} from "./lib.ts";

function printUsage(): void {
  console.error(`사용법:
  deno run -A samples/api_openlaw/cli.ts <law|admrul> [옵션]

명령:
  law      법령 목록 검색 또는 상세 조회
  admrul   행정규칙 목록 검색

공통 옵션:
  --query <텍스트>          목록 검색 질의어
  --id <ID_or_MST>          법령 상세 조회 ID 또는 MST
  --output <경로>           결과 JSON을 파일로 저장
  --env-path <경로>         .env 경로 지정 (기본: ./\.env)
  --verbose                 디버그 정보 출력(stderr)
`);
}

async function main() {
  const parsed = parse(Deno.args, {
    boolean: ["verbose"],
    string: ["query", "id", "output", "env-path"],
    alias: {},
    stopEarly: false,
  });
  const positional = parsed._.map(String);
  const sub = positional[0];
  const verbose = Boolean(parsed.verbose);
  const envPath = typeof parsed["env-path"] === "string"
    ? String(parsed["env-path"])
    : undefined;

  if (!sub || (sub !== "law" && sub !== "admrul")) {
    printUsage();
    Deno.exit(1);
  }

  // Load env
  const envInfo = await loadEnv({ envPath, verbose });
  logVerbose(verbose, `[env] using`, envInfo);

  let oc: string;
  try {
    oc = requireEnv("OPEN_LAW_OC");
  } catch (e) {
    console.error(String(e));
    Deno.exit(1);
    return;
  }

  try {
    if (sub === "law") {
      const q = parsed.query as string | undefined;
      const id = parsed.id as string | undefined;
      if (!!q === !!id) {
        console.error(
          "law 명령은 --query 또는 --id 중 하나만 지정해야 합니다.",
        );
        Deno.exit(1);
      }
      if (q) {
        const data = await searchLaws({ oc, query: q, verbose });
        await outputResult(data, parsed.output as string | undefined, verbose);
        return;
      }
      if (id) {
        const data = await getLawDetail({ oc, idOrMst: id, verbose });
        await outputResult(data, parsed.output as string | undefined, verbose);
        return;
      }
    } else if (sub === "admrul") {
      const q = parsed.query as string | undefined;
      if (!q) {
        console.error("admrul 명령에는 --query 가 필요합니다.");
        Deno.exit(1);
      }
      const data = await searchAdmrul({ oc, query: q, verbose });
      await outputResult(data, parsed.output as string | undefined, verbose);
      return;
    }
  } catch (e) {
    console.error(String(e));
    Deno.exit(1);
  }
}

async function outputResult(
  data: unknown,
  outputPath: string | undefined,
  verbose: boolean,
) {
  const text = JSON.stringify(data, null, 2);
  if (outputPath) {
    const dir = dirname(outputPath);
    if (dir && dir !== ".") await ensureDir(dir);
    await writeOutput(data, outputPath);
    logVerbose(verbose, `[output] saved`, outputPath);
  } else {
    // Print to stdout only
    console.log(text);
  }
}

if (import.meta.main) {
  await main();
}
