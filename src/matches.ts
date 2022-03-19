import { EvaluateResult } from "./compile";

type Integer = number;

export type Environment = {
  mediaType: "screen" | "print" | "not-screen-or-print";
  anyHover: "none" | "hover";
  anyPointer: "none" | "coarse" | "fine";
  colorGamut: "notSrgb" | "srgbButNotP3" | "p3ButNotRec2020" | "rec2020";
  grid: "bitmap" | "grid";
  hover: "none" | "hover";
  overflowBlock: "none" | "scroll" | "paged";
  overflowInline: "none" | "scroll";
  pointer: "none" | "coarse" | "fine";
  scan: "interlace" | "progressive";
  update: "none" | "slow" | "fast";
  widthPx: Integer;
  heightPx: Integer;
  deviceWidthPx: Integer;
  deviceHeightPx: Integer;
  colorBits: Integer;
  colorTable: "none" | Integer;
  dppx: Integer;
};

type DefaultableFeatures =
  | "mediaType"
  | "anyHover"
  | "anyPointer"
  | "colorGamut"
  | "grid"
  | "hover"
  | "overflowBlock"
  | "overflowInline"
  | "pointer"
  | "scan"
  | "update"
  | "colorTable"
  | "colorBits";

export const DESKTOP_ENVIRONMENT: Pick<Environment, DefaultableFeatures> = {
  mediaType: "screen",
  anyHover: "hover",
  anyPointer: "fine",
  colorGamut: "srgbButNotP3",
  grid: "bitmap",
  hover: "hover",
  overflowBlock: "scroll",
  overflowInline: "scroll",
  pointer: "fine",
  scan: "progressive",
  update: "fast",
  colorTable: "none",
  colorBits: 8,
};

const badInput = (key: string): Error => {
  return new Error(`Invalid option: ${key}`);
};

export const validateEnv = (env: Environment) => {
  if (
    env.mediaType !== "screen" &&
    env.mediaType !== "print" &&
    env.mediaType !== "not-screen-or-print"
  ) {
    throw badInput("mediaType");
  }
  if (env.anyHover !== "none" && env.anyHover !== "hover") {
    throw badInput("anyHover");
  }
  if (
    env.anyPointer !== "none" &&
    env.anyPointer !== "coarse" &&
    env.anyPointer !== "fine"
  ) {
    throw badInput("anyPointer");
  }
  if (
    env.colorGamut !== "notSrgb" &&
    env.colorGamut !== "srgbButNotP3" &&
    env.colorGamut !== "p3ButNotRec2020" &&
    env.colorGamut !== "rec2020"
  ) {
    throw badInput("colorGamut");
  }
  if (env.grid !== "bitmap" && env.grid !== "grid") {
    throw badInput("grid");
  }
  if (env.hover !== "none" && env.hover !== "hover") {
    throw badInput("hover");
  }
  if (
    env.overflowBlock !== "none" &&
    env.overflowBlock !== "scroll" &&
    env.overflowBlock !== "paged"
  ) {
    throw badInput("overflowBlock");
  }
  if (env.overflowInline !== "none" && env.overflowInline !== "scroll") {
    throw badInput("overflowInline");
  }
  if (
    env.pointer !== "none" &&
    env.pointer !== "coarse" &&
    env.pointer !== "fine"
  ) {
    throw badInput("pointer");
  }
  if (env.scan !== "interlace" && env.scan !== "progressive") {
    throw badInput("scan");
  }
  if (env.update !== "none" && env.update !== "slow" && env.update !== "fast") {
    throw badInput("update");
  }
  if (!(Number.isInteger(env.widthPx) && env.widthPx >= 0)) {
    throw badInput("widthPx");
  }
  if (!(Number.isInteger(env.heightPx) && env.heightPx >= 0)) {
    throw badInput("heightPx");
  }
  if (!(Number.isInteger(env.deviceWidthPx) && env.deviceWidthPx >= 0)) {
    throw badInput("deviceWidthPx");
  }
  if (!(Number.isInteger(env.deviceHeightPx) && env.deviceHeightPx >= 0)) {
    throw badInput("deviceHeightPx");
  }
  if (!(Number.isInteger(env.colorBits) && env.colorBits >= 0)) {
    throw badInput("colorBits");
  }
  if (!(Number.isInteger(env.dppx) && env.dppx >= 0)) {
    throw badInput("dppx");
  }
  if (
    env.colorTable !== "none" &&
    !(Number.isInteger(env.colorTable) && env.colorTable >= 0)
  ) {
    throw badInput("colorTable");
  }
};

export const matches = (
  compiledQuery: EvaluateResult,
  environment: Omit<Environment, DefaultableFeatures> &
    Partial<Pick<Environment, DefaultableFeatures>>
) => {
  const env: Environment = {
    ...DESKTOP_ENVIRONMENT,
    ...environment,
  };
  validateEnv(env);

  for (const permutation of compiledQuery.permutations) {
    let matches = true;
    for (const key in permutation) {
      const k = key as keyof typeof permutation;
      const p = permutation as Required<typeof permutation>;
      if (k === "media-type") {
        const v = p[k];
        if (v === "print") {
          if (
            env.mediaType === "screen" ||
            env.mediaType === "not-screen-or-print"
          ) {
            matches = false;
            break;
          }
        } else if (v === "screen") {
          if (
            env.mediaType === "print" ||
            env.mediaType === "not-screen-or-print"
          ) {
            matches = false;
            break;
          }
        } else if (v === "not-screen") {
          if (env.mediaType === "screen") {
            matches = false;
            break;
          }
        } else {
          if (env.mediaType === "print") {
            matches = false;
            break;
          }
        }
      } else if (k === "width") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.widthPx < min ||
          env.widthPx > max ||
          (min === env.widthPx && !minInclusive) ||
          (max === env.widthPx && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      }
    }
    if (matches) {
      return true;
    }
  }

  return false;
};
