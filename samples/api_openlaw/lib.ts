import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { resolve } from "https://deno.land/std@0.208.0/path/mod.ts";

interface EnvConfig {
  verbose?: boolean;
  envPath?: string;
}

interface FetchConfig {
  oc: string;
  query?: string;
  id?: string;
  verbose?: boolean;
}

async function findGitRoot(start: string = Deno.cwd()): Promise<string | null> {
    let current = start;
    while (current !== "/") {
        for await (const dirEntry of Deno.readDir(current)) {
            if (dirEntry.name === ".git" && dirEntry.isDirectory) {
                return current;
            }
        }
        const parent = resolve(current, "..");
        if (parent === current) return null;
        current = parent;
    }
    return null;
}


export async function loadEnv({ verbose, envPath }: EnvConfig) {
  const gitRoot = await findGitRoot();
  if (!gitRoot) {
    throw new Error("Could not find git repository root.");
  }

  const defaultEnvPath = resolve(gitRoot, ".env");
  let env = await load({ envPath: defaultEnvPath, export: true });

  if (verbose) {
    console.log(`Loaded environment variables from: ${defaultEnvPath}`);
  }

  if (envPath) {
    const additionalEnvPath = resolve(envPath);
    const additionalEnv = await load({ envPath: additionalEnvPath, export: true, allowEmptyValues: true });
    env = { ...env, ...additionalEnv };
    if (verbose) {
      console.log(`Loaded additional environment variables from: ${additionalEnvPath}`);
    }
  }
  
  const oc = Deno.env.get("OPEN_LAW_OC");
  if (!oc) {
    throw new Error("OPEN_LAW_OC environment variable is not set.");
  }

  return { oc };
}

export async function fetchLaw({ oc, query, id, verbose }: FetchConfig) {
  const BASE_URL = "http://www.law.go.kr/DRF/";
  const params = new URLSearchParams({
    OC: oc,
    type: "JSON",
  });

  let targetUrl: string;

  if (id) {
    targetUrl = `${BASE_URL}lawService.do?target=law`;
    // 법령 ID 형식에 따라 ID 또는 MST로 처리
    if (isNaN(parseInt(id, 10))) {
        params.append("ID", id);
    } else {
        params.append("MST", id);
    }
  } else if (query) {
    targetUrl = `${BASE_URL}lawSearch.do?target=law`;
    params.append("query", query);
  } else {
    throw new Error("Either query or id must be provided.");
  }

  const url = `${targetUrl}&${params.toString()}`;
  if (verbose) {
    console.log(`Requesting URL: ${url}`);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (verbose) {
    console.log("--- API Response ---");
    console.log(JSON.stringify(data, null, 2));
    console.log("--------------------");
  }

  return data;
}

export async function writeOutput(data: unknown, outputPath?: string) {
  const jsonResult = JSON.stringify(data, null, 2);

  if (outputPath) {
    await Deno.writeTextFile(outputPath, jsonResult);
    console.log(`Output successfully written to ${outputPath}`);
  } else {
    console.log(jsonResult);
  }
}
