const { build } = require("esbuild");
const { fork } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const JSON5 = require("json5");
const { paths } = require("node-dir");

const projectRoot = path.join(__dirname, "..");

const SHOULD_BUILD_CLI = false;
const SHOULD_BUILD_LIB = true;

const tsConfig = JSON5.parse(
  fs.readFileSync(path.join(projectRoot, "tsconfig.json"), "utf8")
);

const fixPaths = (rootDir) => {
  return new Promise((resolve, reject) => {
    paths(rootDir, (err, paths) => {
      if (err) return reject(err);
      for (const filePath of paths.files) {
        const dirname = path.join(filePath, "..");
        const relPath = path.relative(dirname, rootDir);
        fs.writeFileSync(
          filePath,
          fs
            .readFileSync(filePath, "utf8")
            .replace(/(["'])media-query-fns\//g, `$1${relPath}/`)
        );
      }
      resolve();
    });
  });
};

const tsc = (config = tsConfig) => {
  fs.writeFileSync(
    path.join(projectRoot, "tsconfig.tmp.json"),
    JSON.stringify(config)
  );
  return new Promise((resolve, reject) => {
    const child = fork(
      "./node_modules/.bin/tsc",
      ["--project", "tsconfig.tmp.json"],
      { cwd: projectRoot }
    );
    child.on("exit", (code) => {
      fs.removeSync(path.join(projectRoot, "tsconfig.tmp.json"));
      if (code) {
        reject(new Error(`Error code: ${code}`));
      } else {
        resolve();
      }
    });
  });
};

const generate = async () => {
  fs.removeSync(path.join(projectRoot, "dist"));

  if (SHOULD_BUILD_CLI) {
    await build({
      entryPoints: ["./cli/index.ts"],
      minify: true,
      bundle: true,
      outfile: "./_dist/media-query-fns",
      platform: "node",
      target: "es2017",
      logLevel: "info",
    });
  }

  if (SHOULD_BUILD_LIB) {
    // cjs
    await tsc({
      ...tsConfig,
      compilerOptions: {
        ...tsConfig.compilerOptions,
        outDir: "_dist/cjs",
      },
      include: ["src/**/*"],
    });
    fixPaths(path.join(projectRoot, "_dist/cjs"));

    await tsc({
      ...tsConfig,
      compilerOptions: {
        ...tsConfig.compilerOptions,
        outDir: "_dist/esm",
        module: "ES2020",
        moduleResolution: "node",
      },
      include: ["src/**/*"],
    });
    fixPaths(path.join(projectRoot, "_dist/esm"));
  }
};

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
