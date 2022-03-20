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
  monochromeBits: "not-monochrome" | Integer;
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
  | "colorBits"
  | "monochromeBits";

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
  monochromeBits: "not-monochrome",
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
    env.monochromeBits !== "not-monochrome" &&
    !(Number.isInteger(env.monochromeBits) && env.monochromeBits >= 0)
  ) {
    throw badInput("monochromeBits");
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
      } else if (k === "any-hover") {
        const v = p[k];
        if (v !== env.anyHover) {
          matches = false;
          break;
        }
      } else if (k === "hover") {
        const v = p[k];
        if (v !== env.hover) {
          matches = false;
          break;
        }
      } else if (k === "any-pointer") {
        const v = p[k];
        if (v !== env.anyPointer) {
          matches = false;
          break;
        }
      } else if (k === "pointer") {
        const v = p[k];
        if (v !== env.pointer) {
          matches = false;
          break;
        }
      } else if (k === "grid") {
        const v = p[k];
        if (
          (v === 0 && env.grid === "grid") ||
          (v === 1 && env.grid === "bitmap")
        ) {
          matches = false;
          break;
        }
      } else if (k === "color-gamut") {
        const [belowSrgb, srgbAndBelowP3, p3AndBelowRec2020, rec2020AndAbove] =
          p[k];
        if (
          (env.colorGamut === "notSrgb" && !belowSrgb) ||
          (env.colorGamut === "srgbButNotP3" && !srgbAndBelowP3) ||
          (env.colorGamut === "p3ButNotRec2020" && !p3AndBelowRec2020) ||
          (env.colorGamut === "rec2020" && !rec2020AndAbove)
        ) {
          matches = false;
          break;
        }
      } else if (k === "orientation") {
        const v = p[k];
        if (
          (v === "portrait" && env.widthPx > env.heightPx) ||
          (v === "landscape" && env.widthPx < env.heightPx)
        ) {
          matches = false;
          break;
        }
      } else if (k === "overflow-block") {
        const v = p[k];
        if (v !== env.overflowBlock) {
          matches = false;
          break;
        }
      } else if (k === "overflow-inline") {
        const v = p[k];
        if (v !== env.overflowInline) {
          matches = false;
          break;
        }
      } else if (k === "scan") {
        const v = p[k];
        if (v !== env.scan) {
          matches = false;
          break;
        }
      } else if (k === "update") {
        const v = p[k];
        if (v !== env.update) {
          matches = false;
          break;
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
      } else if (k === "device-width") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.deviceWidthPx < min ||
          env.deviceWidthPx > max ||
          (min === env.deviceWidthPx && !minInclusive) ||
          (max === env.deviceWidthPx && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "height") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.heightPx < min ||
          env.heightPx > max ||
          (min === env.heightPx && !minInclusive) ||
          (max === env.heightPx && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "device-height") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.deviceHeightPx < min ||
          env.deviceHeightPx > max ||
          (min === env.deviceHeightPx && !minInclusive) ||
          (max === env.deviceHeightPx && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "color") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.colorBits < min ||
          env.colorBits > max ||
          (min === env.colorBits && !minInclusive) ||
          (max === env.colorBits && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "monochrome") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (env.monochromeBits === "not-monochrome") {
          if (
            min > 0 ||
            (min === 0 && !minInclusive) ||
            (max === 0 && !maxInclusive)
          ) {
            matches = false;
            break;
          }
        }
        if (
          env.monochromeBits < min ||
          env.monochromeBits > max ||
          (min === env.monochromeBits && !minInclusive) ||
          (max === env.monochromeBits && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "resolution") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.dppx < min ||
          env.dppx > max ||
          (min === env.dppx && !minInclusive) ||
          (max === env.dppx && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "color-index") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (env.colorTable === "none") {
          if (
            min > 0 ||
            (min === 0 && !minInclusive) ||
            (max === 0 && !maxInclusive)
          ) {
            matches = false;
            break;
          }
        }
        if (
          env.colorTable < min ||
          env.colorTable > max ||
          (min === env.colorTable && !minInclusive) ||
          (max === env.colorTable && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "aspect-ratio") {
        const [minInclusive, minRatio, maxRatio, maxInclusive] = p[k];
        const min = minRatio[0] / minRatio[1];
        const max = maxRatio[0] / maxRatio[1];
        const aspectRatio = env.widthPx / env.heightPx;
        if (
          aspectRatio < min ||
          aspectRatio > max ||
          (min === aspectRatio && !minInclusive) ||
          (max === aspectRatio && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else {
        const [minInclusive, minRatio, maxRatio, maxInclusive] = p[k];
        const min = minRatio[0] / minRatio[1];
        const max = maxRatio[0] / maxRatio[1];
        const aspectRatio = env.deviceWidthPx / env.deviceHeightPx;
        if (
          aspectRatio < min ||
          aspectRatio > max ||
          (min === aspectRatio && !minInclusive) ||
          (max === aspectRatio && !maxInclusive)
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
