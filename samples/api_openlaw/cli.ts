import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";
import { loadEnv, fetchLaw, writeOutput } from "./lib.ts";

async function main() {
  const { _, id, verbose, output, "env-path": envPath } = parse(Deno.args, {
    string: ["id", "output", "env-path"],
    boolean: ["verbose"],
  });

  const query = _.join(" ");

  try {
    const config = await loadEnv({ verbose, envPath });
    if (verbose) {
      console.log("Configuration loaded.");
    }

    if (!query && !id) {
      console.error("Error: A search query or a law ID with --id is required.");
      Deno.exit(1);
    }

    const result = await fetchLaw({ ...config, query, id, verbose });
    await writeOutput(result, output);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
