import { FeatureNode, QueryListNode } from "media-query-parser";
import { solveMediaQuery_ } from "./solveMediaQuery.js";

export type Kleene3 = "true" | "false" | "unknown";
export const not = (x: Kleene3): Kleene3 => {
  if (x === "true") return "false";
  else if (x === "false") return "true";
  return "unknown";
};
export const and = (a: Kleene3, b: Kleene3): Kleene3 => {
  if (a === "false" || b === "false") return "false";
  else if (a === "unknown" || b === "unknown") return "unknown";
  return "true";
};

export type SolverConfig = {
  solveUnknownFeature: (fn: FeatureNode) => Kleene3;
  solveGeneralEnclosed: () => Kleene3;
  isLegacyBrowser: Kleene3;
  isMediaTypeScreen: Kleene3;
  features: Map<
    string,
    | {
        type: "discrete";
        values: Set<string | number>;
      }
    | {
        type: "range";
        valueType: "length" | "integer" | "resolution";
        canBeZero: boolean;
        canBeNegative: boolean;
        extraValues: Map<string, number | "unknown">;
      }
    | {
        type: "range";
        valueType: "ratio";
        canNumeratorBeZero: boolean;
        canDenominatorBeZero: boolean;
        extraValues: Map<string, number | "unknown">;
      }
  >;
};
export type SolverConfigInput = Partial<{
  solveUnknownFeature: (fn: FeatureNode) => Kleene3;
  solveGeneralEnclosed: () => Kleene3;
  isMediaTypeScreen: Kleene3;
  isLegacyBrowser: Kleene3;
  features: Record<
    string,
    | {
        type: "discrete";
        values: Array<string | number>;
      }
    | {
        type: "range";
        valueType: "length" | "integer" | "resolution";
        canBeZero: boolean;
        canBeNegative: boolean;
        extraValues?: Record<string, number | "unknown">;
      }
    | {
        type: "range";
        valueType: "ratio";
        canNumeratorBeZero: boolean;
        canDenominatorBeZero: boolean;
        extraValues?: Record<string, number | "unknown">;
      }
  >;
}>;

export const DEFAULT_KNOWN_FEATURES: SolverConfigInput["features"] = {
  "color-gamut": { type: "discrete", values: ["srgb", "p3", "rec2020"] },
  "display-mode": {
    type: "discrete",
    values: ["fullscreen", "standalone", "minimal-ui", "browser"],
  },
  "dynamic-range": { type: "discrete", values: ["standard", "high"] },
  "environment-blending": { type: "discrete", values: ["opaque", "additive", "subtractive"] },
  orientation: { type: "discrete", values: ["portrait", "landscape"] },
  "prefers-color-scheme": { type: "discrete", values: ["light", "dark"] },
  "prefers-contrast": { type: "discrete", values: ["no-preference", "less", "more", "custom"] },
  "prefers-reduced-data": { type: "discrete", values: ["no-preference", "reduce"] },
  "prefers-reduced-motion": { type: "discrete", values: ["no-preference", "reduce"] },
  "prefers-reduced-transparency": { type: "discrete", values: ["no-preference", "reduce"] },
  scan: { type: "discrete", values: ["interlace", "progressive"] },
  "video-color-gamut": { type: "discrete", values: ["srgb", "p3", "rec2020"] },
  "video-dynamic-range": { type: "discrete", values: ["standard", "high"] },
  "any-hover": { type: "discrete", values: ["none", "hover"] },
  "any-pointer": { type: "discrete", values: ["none", "coarse", "fine"] },
  "forced-colors": { type: "discrete", values: ["none", "active"] },
  hover: { type: "discrete", values: ["none", "hover"] },
  "inverted-colors": { type: "discrete", values: ["none", "inverted"] },
  "nav-controls": { type: "discrete", values: ["none", "back"] },
  "overflow-block": { type: "discrete", values: ["none", "scroll", "paged"] },
  "overflow-inline": { type: "discrete", values: ["none", "scroll"] },
  pointer: { type: "discrete", values: ["none", "coarse", "fine"] },
  update: { type: "discrete", values: ["none", "slow", "fast"] },
  scripting: { type: "discrete", values: ["none", "initial-only", "enabled"] },
  grid: { type: "discrete", values: [0, 1] },
  resolution: {
    type: "range",
    valueType: "resolution",
    canBeZero: true,
    canBeNegative: false,
    extraValues: { infinite: Number.POSITIVE_INFINITY },
  },
  "device-height": { type: "range", valueType: "length", canBeZero: true, canBeNegative: false },
  "device-width": { type: "range", valueType: "length", canBeZero: true, canBeNegative: false },
  height: { type: "range", valueType: "length", canBeZero: true, canBeNegative: false },
  width: { type: "range", valueType: "length", canBeZero: true, canBeNegative: false },
  "device-aspect-ratio": {
    type: "range",
    valueType: "ratio",
    canNumeratorBeZero: true,
    canDenominatorBeZero: true,
  },
  "aspect-ratio": {
    type: "range",
    valueType: "ratio",
    canNumeratorBeZero: true,
    canDenominatorBeZero: true,
  },
  color: { type: "range", valueType: "integer", canBeZero: true, canBeNegative: false },
  "horizontal-viewport-segments": {
    type: "range",
    valueType: "integer",
    canBeZero: true,
    canBeNegative: false,
  },
  "color-index": { type: "range", valueType: "integer", canBeZero: true, canBeNegative: false },
  monochrome: { type: "range", valueType: "integer", canBeZero: true, canBeNegative: false },
  "vertical-viewport-segments": {
    type: "range",
    valueType: "integer",
    canBeZero: true,
    canBeNegative: false,
  },
};

const entries = <T extends string, U>(obj: Record<T, U>): [T, U][] =>
  Object.entries(obj) as [T, U][];

export const createSolverConfig = (
  solverConfigInput?: SolverConfigInput | undefined
): SolverConfig => {
  const features: SolverConfig["features"] = new Map();
  for (const [name, data] of entries({
    ...DEFAULT_KNOWN_FEATURES,
    ...solverConfigInput?.features,
  })) {
    if (data.type === "discrete") {
      features.set(name, { ...data, values: new Set(data.values ?? []) });
    } else {
      features.set(name, { ...data, extraValues: new Map(entries(data?.extraValues ?? {})) });
    }
  }
  return {
    solveUnknownFeature: solverConfigInput?.solveUnknownFeature ?? (() => "unknown"),
    solveGeneralEnclosed: solverConfigInput?.solveGeneralEnclosed ?? (() => "unknown"),
    isMediaTypeScreen: solverConfigInput?.isMediaTypeScreen ?? "unknown",
    isLegacyBrowser: solverConfigInput?.isLegacyBrowser ?? "unknown",
    features,
  };
};

export const solveMediaQueryList = (
  mediaQueryList: QueryListNode,
  configInput?: SolverConfigInput
): Kleene3 => solveMediaQueryList_(mediaQueryList, createSolverConfig(configInput));

export const solveMediaQueryList_ = (
  mediaQueryList: QueryListNode,
  config: SolverConfig
): Kleene3 => {
  const results = mediaQueryList.qs.map((q) =>
    q === undefined ? "false" : solveMediaQuery_(q, config)
  );

  if (results.length === 0) {
    return "true";
  } else {
    let value: Kleene3 = "false";
    for (const result of results) {
      if (result === "true") {
        return "true";
      } else if (result === "unknown") {
        value = "unknown";
      }
    }
    return value;
  }
};
