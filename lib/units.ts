import { MediaFeature, ValidValueToken } from "media-query-parser";
import {
  isFeatureKey,
  isRangeKey,
  MediaFeatures,
  RangeFeatures,
  RangeNumberFeatures,
  RANGE_NUMBER_FEATURES,
} from "./helpers.js";
import { CompileOptions } from "./compile.js";

export type LengthUnit = {
  type: "dimension";
  subtype: "length";
  px: number;
};
export type TimeUnit = {
  type: "dimension";
  subtype: "time";
  ms: number;
};
export type FrequencyUnit = {
  type: "dimension";
  subtype: "frequency";
  hz: number;
};
export type ResolutionUnit = {
  type: "dimension";
  subtype: "resolution";
  dppx: number;
};
export type InfiniteUnit = {
  type: "infinite";
};
export type IdentUnit = {
  type: "ident";
  value: string;
};
export type DimensionUnit =
  | LengthUnit
  | TimeUnit
  | FrequencyUnit
  | ResolutionUnit
  | InfiniteUnit
  | IdentUnit;

export type NumberUnit = {
  type: "number";
  value: number;
};
export type RatioUnit = {
  type: "ratio";
  numerator: number;
  denominator: number;
};
export type Unit = DimensionUnit | NumberUnit | RatioUnit;

export type UnitConversions = {
  // = 100vw
  widthPx: number;
  // = 100vh
  heightPx: number;
  // used to determine vi and vb
  writingMode: "horizontal-tb" | "vertical-rl" | "vertical-lr" | "sideways-rl" | "sideways-lr";
  // also used for rem
  emPx: number;
  // also used for rlh
  lhPx: number;
  // font-specific sizes
  exPx: number;
  chPx: number;
  capPx: number;
  icPx: number;
};
export type CompiledUnitConversions = {
  vw: number;
  vh: number;
  vmin: number;
  vmax: number;
  vi: number;
  vb: number;
  em: number;
  rem: number;
  lh: number;
  rlh: number;
  ex: number;
  ch: number;
  cap: number;
  ic: number;
  cm: number;
  mm: number;
  in: number;
  q: number;
  pc: number;
  pt: number;
};

const DEFAULT_UNIT_CONVERSIONS: UnitConversions = {
  // = 100vw
  widthPx: 1920,
  // = 100vh
  heightPx: 1080,
  // used to determine vi and vb
  writingMode: "horizontal-tb",
  // also used for rem
  emPx: 16,
  // also used for rlh
  lhPx: 16,
  // font-specific sizes
  exPx: 8,
  chPx: 8,
  capPx: 11,
  icPx: 16,
};

export const convertToUnit = (
  token: ValidValueToken,
  unitConversions: CompiledUnitConversions
): Unit => {
  if (token.type === "number") {
    return {
      type: "number",
      value: token.value,
    };
  } else if (token.type === "dimension") {
    let unitType: "length" | "time" | "frequency" | "resolution";
    switch (token.unit) {
      case "s":
      case "ms": {
        unitType = "time";
        break;
      }
      case "hz":
      case "khz": {
        unitType = "frequency";
        break;
      }
      case "dpi":
      case "dpcm":
      case "dppx":
      case "x": {
        unitType = "resolution";
        break;
      }
      default: {
        unitType = "length";
      }
    }

    if (token.unit === "px") {
      return {
        type: "dimension",
        subtype: "length",
        px: token.value,
      };
    } else if (unitType === "time") {
      return {
        type: "dimension",
        subtype: "time",
        ms: token.unit === "s" ? Math.round(token.value * 1000) : token.value,
      };
    } else if (unitType === "frequency") {
      return {
        type: "dimension",
        subtype: "frequency",
        hz: token.unit === "khz" ? Math.round(token.value * 1000) : token.value,
      };
    } else if (unitType === "resolution") {
      let dppx = token.value;
      if (token.unit === "dpi") {
        dppx = Number.parseFloat((token.value * 0.0104166667).toFixed(3));
      } else if (token.unit === "dpcm") {
        dppx = Number.parseFloat((token.value * 0.0264583333).toFixed(3));
      }
      return {
        type: "dimension",
        subtype: "resolution",
        dppx,
      };
    } else {
      if (token.unit in unitConversions) {
        const factor = unitConversions[token.unit as keyof CompiledUnitConversions];
        return {
          type: "dimension",
          subtype: "length",
          px: Number.parseFloat((token.value * factor).toFixed(3)),
        };
      } else {
        return {
          type: "ident",
          value: "{never}",
        };
      }
    }
  } else if (token.type === "ident") {
    if (token.value === "infinite") {
      return {
        type: "infinite",
      };
    } else {
      return {
        type: "ident",
        value: token.value,
      };
    }
  } else {
    return {
      type: "ratio",
      numerator: token.numerator,
      denominator: token.denominator,
    };
  }
};

export const compileStaticUnitConversions = (
  units: Partial<UnitConversions>
): CompiledUnitConversions => {
  // increasing emPx should also increase other units,
  // but any units passed in override these defaults
  let impliedUnits: Partial<Pick<UnitConversions, "exPx" | "chPx" | "capPx" | "icPx">> = {};
  if (typeof units.emPx === "number") {
    impliedUnits = {
      exPx: Math.round(units.emPx * 0.5),
      chPx: Math.round(units.emPx * 0.5),
      capPx: Math.round(units.emPx * 0.7),
      icPx: Math.round(units.emPx),
    };
  }
  const mergedUnits = {
    ...DEFAULT_UNIT_CONVERSIONS,
    ...impliedUnits,
    ...units,
  };
  const {
    widthPx,
    heightPx,
    writingMode,
    emPx: em,
    lhPx: lh,
    exPx: ex,
    chPx: ch,
    capPx: cap,
    icPx: ic,
  } = mergedUnits;
  const vw = widthPx / 100;
  const vh = heightPx / 100;
  const vmin = Math.min(vh, vw);
  const vmax = Math.max(vh, vw);
  const vi = writingMode === "horizontal-tb" ? vw : vh;
  const vb = writingMode === "horizontal-tb" ? vh : vw;
  return {
    em,
    rem: em,
    lh,
    rlh: lh,
    ex,
    ch,
    cap,
    ic,
    vw,
    vh,
    vmin,
    vmax,
    vi,
    vb,
    cm: 37.79527559,
    mm: 0.03779527559,
    in: 96,
    q: 0.009448818898,
    pc: 16,
    pt: 16,
  };
};

export type DoubleRange = {
  type: "double";
  name: keyof RangeFeatures;
  min: Unit;
  minOp: "<" | "<=" | ">" | ">=";
  maxOp: "<" | "<=" | ">" | ">=";
  max: Unit;
};
export type SingleRange = {
  type: "single";
  name: keyof RangeFeatures;
  op: "<" | "<=" | ">" | ">=";
  value: Unit;
};
export type Equality = {
  type: "equals";
  name: keyof MediaFeatures;
  value: Unit;
};
export type BoolCtx = {
  type: "boolean";
  name: keyof MediaFeatures;
};
export type Invalid = {
  type: "invalid";
  name: string;
};

const REVERSED_OP_MAP = {
  "<": ">",
  "<=": ">=",
  ">": "<",
  ">=": "<=",
} as const;

export const simplifyMediaFeature = (
  mediaFeature: MediaFeature,
  unitConversions: CompiledUnitConversions
): DoubleRange | SingleRange | Equality | BoolCtx | Invalid => {
  if (mediaFeature.context === "range") {
    if (isRangeKey(mediaFeature.feature)) {
      const { range, feature } = mediaFeature;
      if (range.leftToken !== undefined && range.rightToken !== undefined) {
        if (range.leftOp === "<" || range.leftOp === "<=") {
          return {
            type: "double",
            name: feature,
            minOp: range.leftOp,
            min: convertToUnit(range.leftToken, unitConversions),
            maxOp: range.rightOp,
            max: convertToUnit(range.rightToken, unitConversions),
          };
        } else {
          return {
            type: "double",
            name: feature,
            minOp: range.rightOp === ">" ? "<" : "<=",
            min: convertToUnit(range.rightToken, unitConversions),
            maxOp: range.leftOp === ">" ? "<" : "<=",
            max: convertToUnit(range.leftToken, unitConversions),
          };
        }
      } else if (range.rightToken === undefined) {
        if (range.leftOp === "=") {
          return {
            type: "equals",
            name: feature,
            value: convertToUnit(range.leftToken, unitConversions),
          };
        } else {
          return {
            type: "single",
            name: feature,
            op: REVERSED_OP_MAP[range.leftOp],
            value: convertToUnit(range.leftToken, unitConversions),
          };
        }
      } else {
        if (range.rightOp === "=") {
          return {
            type: "equals",
            name: feature,
            value: convertToUnit(range.rightToken, unitConversions),
          };
        } else {
          return {
            type: "single",
            name: feature,
            op: range.rightOp,
            value: convertToUnit(range.rightToken, unitConversions),
          };
        }
      }
    }
  } else if (mediaFeature.context === "value") {
    if (mediaFeature.feature === "orientation") {
      if (mediaFeature.prefix === undefined && mediaFeature.value.type === "ident") {
        if (mediaFeature.value.value === "portrait") {
          return {
            type: "single",
            name: "aspect-ratio",
            op: "<=",
            value: {
              type: "ratio",
              numerator: 1,
              denominator: 1,
            },
          };
        } else if (mediaFeature.value.value === "landscape") {
          return {
            type: "single",
            name: "aspect-ratio",
            op: ">=",
            value: {
              type: "ratio",
              numerator: 1,
              denominator: 1,
            },
          };
        }
      }
    } else if (isFeatureKey(mediaFeature.feature)) {
      if (mediaFeature.prefix === undefined) {
        return {
          type: "equals",
          name: mediaFeature.feature,
          value: convertToUnit(mediaFeature.value, unitConversions),
        };
      } else if (isRangeKey(mediaFeature.feature)) {
        if (mediaFeature.prefix === "min") {
          return {
            type: "single",
            name: mediaFeature.feature,
            op: ">=",
            value: convertToUnit(mediaFeature.value, unitConversions),
          };
        } else {
          return {
            type: "single",
            name: mediaFeature.feature,
            op: "<=",
            value: convertToUnit(mediaFeature.value, unitConversions),
          };
        }
      }
    }
  } else if (mediaFeature.feature === "orientation") {
    return {
      type: "double",
      name: "aspect-ratio",
      min: {
        type: "ratio",
        numerator: 0,
        denominator: 1,
      },
      minOp: "<",
      maxOp: "<",
      max: {
        type: "ratio",
        numerator: Number.POSITIVE_INFINITY,
        denominator: 1,
      },
    };
  } else if (isFeatureKey(mediaFeature.feature)) {
    return {
      type: "boolean",
      name: mediaFeature.feature,
    };
  }

  return {
    type: "invalid",
    name: mediaFeature.feature,
  };
};

export const getRatio = (unit: Unit): null | readonly [number, number] => {
  if (unit.type === "number" && unit.value > 0) {
    return [unit.value, 1];
  } else if (unit.type === "ratio") {
    return [unit.numerator, unit.denominator];
  } else {
    return null;
  }
};

export const getValue = (
  unit: Unit,
  name: keyof RangeNumberFeatures,
  options: CompileOptions
): null | number => {
  // eslint-disable-next-line security/detect-object-injection
  const featData = RANGE_NUMBER_FEATURES[name];
  if (unit.type === "infinite") {
    if (name === "resolution") return Number.POSITIVE_INFINITY;
  } else if (featData.type === "integer") {
    if (unit.type === "number" && Number.isInteger(unit.value)) {
      return unit.value;
    }
  } else if (featData.type === "resolution") {
    if (unit.type === "dimension" && unit.subtype === "resolution") {
      return unit.dppx;
    }
  } else if (featData.type === "length") {
    if (unit.type === "dimension" && unit.subtype === "length") {
      return unit.px;
    } else if (
      unit.type === "number" &&
      (unit.value === 0 || options.shouldAllowNonZeroUnitlessPxLengths)
    ) {
      return unit.value;
    }
  }
  return null;
};
