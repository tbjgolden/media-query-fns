const { statSync } = require("node:fs");
const { resolve } = require("node:path");
const { builtinModules } = require("node:module");

const builtins = new Set(builtinModules);
/** @param {string} str */
const isBuiltIn = (str) => {
  if (str.startsWith("node:")) str = str.slice(5);
  return builtins.has(str);
};

const resolveLocalImport = import("xnr").then(({ resolveLocalImport }) => resolveLocalImport);

/** @type {import('jest-resolve').AsyncResolver} */
const asyncResolver = async (
  /** @type {Parameters<import('jest-resolve').AsyncResolver>[0]} */ importPath,
  /** @type {Parameters<import('jest-resolve').AsyncResolver>[1]} */ options
) => {
  const prefix = "jest-sequencer-";
  if (importPath.startsWith(prefix)) importPath = importPath.slice(prefix.length);

  if (isBuiltIn(importPath) || importPath.startsWith(options.basedir + "/node_modules/")) {
    return options.defaultResolver(importPath, options);
  } else {
    // override local only
    const absImportPath = resolve(options.basedir ?? process.cwd(), importPath);
    const filePath = (await resolveLocalImport)({
      type: "import",
      absImportPath,
      parentExt: ".ts",
      checkFile: (filePath) => {
        try {
          return statSync(filePath).isFile();
        } catch {
          return false;
        }
      },
    });
    if (!filePath) {
      throw new Error("Could not resolve " + importPath + " from " + options.basedir);
    }
    return filePath;
  }
};

module.exports = { async: asyncResolver };
