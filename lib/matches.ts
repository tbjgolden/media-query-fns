/* eslint-disable security/detect-object-injection */
import { EvaluateResult } from "./compile.js";

type Integer = number;

export type Environment = {
  mediaType: "screen" | "print" | "not-screen-or-print";
  anyHover: "none" | "hover";
  anyPointer: "none" | "coarse" | "fine";
  colorGamut: "not-srgb" | "srgb-but-not-p3" | "p3-but-not-rec2020" | "rec2020";
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
  colorIndex: "none" | Integer;
  dppx: Integer;
  displayMode: "fullscreen" | "standalone" | "minimal-ui" | "browser";
  dynamicRange: "not-hdr" | "hdr";
  environmentBlending: "opaque" | "additive" | "subtractive";
  forcedColors: "none" | "active";
  invertedColors: "none" | "inverted";
  navControls: "none" | "back";
  prefersColorScheme: "no-preference" | "light" | "dark";
  prefersContrast: "no-preference" | "less" | "more" | "custom";
  prefersReducedData: "no-preference" | "reduce";
  prefersReducedMotion: "no-preference" | "reduce";
  prefersReducedTransparency: "no-preference" | "reduce";
  scripting: "none" | "initial-only" | "enabled";
  videoColorGamut: "not-srgb" | "srgb-but-not-p3" | "p3-but-not-rec2020" | "rec2020";
  videoDynamicRange: "not-hdr" | "hdr";
  horizontalViewportSegments: Integer;
  verticalViewportSegments: Integer;
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
  | "colorIndex"
  | "colorBits"
  | "monochromeBits"
  | "displayMode"
  | "dynamicRange"
  | "environmentBlending"
  | "forcedColors"
  | "invertedColors"
  | "navControls"
  | "prefersColorScheme"
  | "prefersContrast"
  | "prefersReducedData"
  | "prefersReducedMotion"
  | "prefersReducedTransparency"
  | "scripting"
  | "videoColorGamut"
  | "videoDynamicRange"
  | "horizontalViewportSegments"
  | "verticalViewportSegments";

export const DESKTOP_ENVIRONMENT: Pick<Environment, DefaultableFeatures> = {
  mediaType: "screen",
  anyHover: "hover",
  anyPointer: "fine",
  colorGamut: "srgb-but-not-p3",
  grid: "bitmap",
  hover: "hover",
  overflowBlock: "scroll",
  overflowInline: "scroll",
  pointer: "fine",
  scan: "progressive",
  update: "fast",
  colorIndex: "none",
  colorBits: 8,
  monochromeBits: "not-monochrome",
  displayMode: "browser",
  dynamicRange: "not-hdr",
  environmentBlending: "opaque",
  forcedColors: "none",
  invertedColors: "none",
  navControls: "back",
  prefersColorScheme: "no-preference",
  prefersContrast: "no-preference",
  prefersReducedData: "no-preference",
  prefersReducedMotion: "no-preference",
  prefersReducedTransparency: "no-preference",
  scripting: "enabled",
  videoColorGamut: "srgb-but-not-p3",
  videoDynamicRange: "not-hdr",
  horizontalViewportSegments: 1,
  verticalViewportSegments: 1,
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
  if (env.anyPointer !== "none" && env.anyPointer !== "coarse" && env.anyPointer !== "fine") {
    throw badInput("anyPointer");
  }
  if (
    env.colorGamut !== "not-srgb" &&
    env.colorGamut !== "srgb-but-not-p3" &&
    env.colorGamut !== "p3-but-not-rec2020" &&
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
  if (env.pointer !== "none" && env.pointer !== "coarse" && env.pointer !== "fine") {
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
  if (env.dppx <= 0) {
    throw badInput("dppx");
  }
  if (
    env.monochromeBits !== "not-monochrome" &&
    !(Number.isInteger(env.monochromeBits) && env.monochromeBits >= 0)
  ) {
    throw badInput("monochromeBits");
  }
  if (env.colorIndex !== "none" && !(Number.isInteger(env.colorIndex) && env.colorIndex >= 0)) {
    throw badInput("colorIndex");
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

  for (const simplePerm of compiledQuery.simplePerms) {
    let matches = true;
    for (const key in simplePerm) {
      const k = key as keyof typeof simplePerm;
      const p = simplePerm as Required<typeof simplePerm>;
      if (k === "media-type") {
        const v = p[k];
        if (v === "print") {
          if (env.mediaType === "screen" || env.mediaType === "not-screen-or-print") {
            matches = false;
            break;
          }
        } else if (v === "screen") {
          if (env.mediaType === "print" || env.mediaType === "not-screen-or-print") {
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
        if ((v === 0 && env.grid === "grid") || (v === 1 && env.grid === "bitmap")) {
          matches = false;
          break;
        }
      } else if (k === "color-gamut") {
        const [belowSrgb, srgbAndBelowP3, p3AndBelowRec2020, rec2020AndAbove] = p[k];
        if (
          (env.colorGamut === "not-srgb" && !belowSrgb) ||
          (env.colorGamut === "srgb-but-not-p3" && !srgbAndBelowP3) ||
          (env.colorGamut === "p3-but-not-rec2020" && !p3AndBelowRec2020) ||
          (env.colorGamut === "rec2020" && !rec2020AndAbove)
        ) {
          matches = false;
          break;
        }
      } else if (k === "video-color-gamut") {
        const [belowSrgb, srgbAndBelowP3, p3AndBelowRec2020, rec2020AndAbove] = p[k];
        if (
          (env.videoColorGamut === "not-srgb" && !belowSrgb) ||
          (env.videoColorGamut === "srgb-but-not-p3" && !srgbAndBelowP3) ||
          (env.videoColorGamut === "p3-but-not-rec2020" && !p3AndBelowRec2020) ||
          (env.videoColorGamut === "rec2020" && !rec2020AndAbove)
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
      } else if (k === "scripting") {
        const v = p[k];
        if (v !== env.scripting) {
          matches = false;
          break;
        }
      } else if (k === "display-mode") {
        const v = p[k];
        if (v !== env.displayMode) {
          matches = false;
          break;
        }
      } else if (k === "environment-blending") {
        const v = p[k];
        if (v !== env.environmentBlending) {
          matches = false;
          break;
        }
      } else if (k === "forced-colors") {
        const v = p[k];
        if (v !== env.forcedColors) {
          matches = false;
          break;
        }
      } else if (k === "inverted-colors") {
        const v = p[k];
        if (v !== env.invertedColors) {
          matches = false;
          break;
        }
      } else if (k === "nav-controls") {
        const v = p[k];
        if (v !== env.navControls) {
          matches = false;
          break;
        }
      } else if (k === "prefers-color-scheme") {
        const v = p[k];
        if (v !== env.prefersColorScheme) {
          matches = false;
          break;
        }
      } else if (k === "prefers-contrast") {
        const v = p[k];
        if (v !== env.prefersContrast) {
          matches = false;
          break;
        }
      } else if (k === "prefers-reduced-data") {
        const v = p[k];
        if (v !== env.prefersReducedData) {
          matches = false;
          break;
        }
      } else if (k === "prefers-reduced-motion") {
        const v = p[k];
        if (v !== env.prefersReducedMotion) {
          matches = false;
          break;
        }
      } else if (k === "prefers-reduced-transparency") {
        const v = p[k];
        if (v !== env.prefersReducedTransparency) {
          matches = false;
          break;
        }
      } else if (k === "dynamic-range") {
        const v = p[k];
        if (v === "high" && env.dynamicRange === "not-hdr") {
          matches = false;
          break;
        }
      } else if (k === "video-dynamic-range") {
        const v = p[k];
        if (v === "high" && env.videoDynamicRange === "not-hdr") {
          matches = false;
          break;
        }
      } else if (k === "vertical-viewport-segments") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.verticalViewportSegments < min ||
          env.verticalViewportSegments > max ||
          (min === env.verticalViewportSegments && !minInclusive) ||
          (max === env.verticalViewportSegments && !maxInclusive)
        ) {
          matches = false;
          break;
        }
      } else if (k === "horizontal-viewport-segments") {
        const [minInclusive, min, max, maxInclusive] = p[k];
        if (
          env.horizontalViewportSegments < min ||
          env.horizontalViewportSegments > max ||
          (min === env.horizontalViewportSegments && !minInclusive) ||
          (max === env.horizontalViewportSegments && !maxInclusive)
        ) {
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
          if (min > 0 || (min === 0 && !minInclusive) || (max === 0 && !maxInclusive)) {
            matches = false;
          }
        } else if (
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
        if (env.colorIndex === "none") {
          if (min > 0 || (min === 0 && !minInclusive) || (max === 0 && !maxInclusive)) {
            matches = false;
            break;
          }
        } else if (
          env.colorIndex < min ||
          env.colorIndex > max ||
          (min === env.colorIndex && !minInclusive) ||
          (max === env.colorIndex && !maxInclusive)
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
        // "device-aspect-ratio"
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
