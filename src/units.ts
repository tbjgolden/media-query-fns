import {
  NumberToken,
  DimensionToken,
  RatioToken,
  IdentToken,
} from "media-query-parser";

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
  writingMode:
    | "horizontal-tb"
    | "vertical-rl"
    | "vertical-lr"
    | "sideways-rl"
    | "sideways-lr";
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
  token: NumberToken | DimensionToken | RatioToken | IdentToken,
  unitConversions: CompiledUnitConversions
): Unit => {
  if (token.type === "<number-token>") {
    return {
      type: "number",
      value: token.value,
    };
  } else if (token.type === "<dimension-token>") {
    let unitType: "length" | "time" | "frequency" | "resolution";
    switch (token.unit) {
      case "s":
      case "ms":
        unitType = "time";
        break;
      case "hz":
      case "khz":
        unitType = "frequency";
        break;
      case "dpi":
      case "dpcm":
      case "dppx":
      case "x":
        unitType = "resolution";
        break;
      default:
        unitType = "length";
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
        dppx = parseFloat((token.value * 0.0104166667).toFixed(3));
      } else if (token.unit === "dpcm") {
        dppx = parseFloat((token.value * 0.0264583333).toFixed(3));
      }
      return {
        type: "dimension",
        subtype: "resolution",
        dppx,
      };
    } else {
      if (token.unit in unitConversions) {
        const factor =
          unitConversions[token.unit as keyof CompiledUnitConversions];
        return {
          type: "dimension",
          subtype: "length",
          px: parseFloat((token.value * factor).toFixed(3)),
        };
      } else {
        return {
          type: "ident",
          value: "{invalid}",
        };
      }
    }
  } else if (token.type === "<ident-token>") {
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
  let impliedUnits: Partial<
    Pick<UnitConversions, "exPx" | "chPx" | "capPx" | "icPx">
  > = {};
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
