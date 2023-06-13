const { statSync } = require("node:fs");
const { resolve } = require("node:path");

const resolveLocalImport = import("xnr").then(({ resolveLocalImport }) => resolveLocalImport);

/** @type {import('jest-resolve').AsyncResolver} */
const asyncResolver = async (
  /** @type {Parameters<import('jest-resolve').AsyncResolver>[0]} */ importPath,
  /** @type {Parameters<import('jest-resolve').AsyncResolver>[1]} */ options
) => {
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
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
  } else {
    return options.defaultResolver(importPath, options);
  }
};

module.exports = { async: asyncResolver };
