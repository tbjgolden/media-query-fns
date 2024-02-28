import { readFile, writeFile, rm, mkdir, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { checkDirectory, readJSON } from "./lib/utils.js";
import { minify } from "terser";
import { format } from "prettier";

checkDirectory();

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

type TSConfig = {
  compilerOptions: { [args: string]: unknown };
  include?: string[];
  exclude?: string[];
  [args: string]: unknown;
};
const tsconfigJson = readJSON<TSConfig>(await readFile("tsconfig.json", "utf8"));
const buildTsconfig: TSConfig = {
  ...tsconfigJson,
  exclude: [...(tsconfigJson.exclude ?? []), "**/*.test.ts"],
  include: (tsconfigJson.include ?? []).filter((path) => !path.startsWith(".")),
  compilerOptions: { ...tsconfigJson.compilerOptions, noEmit: false },
};
await writeFile("tsconfig.tmp.json", JSON.stringify(buildTsconfig));
await new Promise<void>((resolve, reject) => {
  const child = spawn("npx", ["tsc", "--project", "tsconfig.tmp.json"]);
  child.on("exit", async (code) => {
    if (code) reject(new Error(`Error code: ${code}`));
    else resolve();
  });
});
await rm("tsconfig.tmp.json");

const toSearch = ["dist"];
let directory: string | undefined;
while ((directory = toSearch.pop())) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      toSearch.push(join(directory, entry.name));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const filePath = join(directory, entry.name);
      const code = await readFile(filePath, "utf8");
      const result = await minify(code, { ecma: 2020, module: true });
      if (result.code) {
        await writeFile(
          filePath,
          await format(result.code, {
            printWidth: 100,
            useTabs: true,
            parser: "babel",
            semi: false,
            singleQuote: true,
            trailingComma: "none",
            bracketSpacing: false,
            proseWrap: "always",
            arrowParens: "avoid",
            endOfLine: "lf",
            quoteProps: "as-needed",
          }),
        );
      }
    }
  }
}
