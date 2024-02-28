import { NumberNode, RatioNode, ValueNode, DimensionNode } from "media-query-parser";

type IntegerValueNode = Omit<NumberNode, "flag"> & { flag: "integer" };
type LengthValueNode =
  | (Omit<NumberNode, "flag" | "value"> & { flag: "integer"; value: 0 })
  | (Omit<DimensionNode, "unit"> & { unit: LengthUnit });
type ResolutionValueNode = Omit<DimensionNode, "unit"> & { unit: ResolutionUnit };
type RatioValueNode = IntegerValueNode | RatioNode;

// ---

export const isValueInteger = (value: ValueNode): value is IntegerValueNode => {
  return value._t === "number" && value.flag === "integer";
};
export const isValueLength = (value: ValueNode): value is LengthValueNode => {
  return (
    (value._t === "dimension" && isLengthUnit(value.unit)) ||
    (value._t === "number" && value.flag === "integer" && value.value === 0)
  );
};
export const isValueResolution = (value: ValueNode): value is ResolutionValueNode => {
  return value._t === "dimension" && isResolutionUnit(value.unit);
};
export const isValueRatio = (value: ValueNode): value is RatioValueNode => {
  return value._t === "ratio" || (isValueInteger(value) && value.value >= 0);
};

type AbsoluteLengthUnit = "cm" | "mm" | "q" | "in" | "pc" | "pt" | "px";
/* prettier-ignore */
type RelativeLengthUnit =
  | "em" | "ex" | "cap" | "ch" | "ic" | "rem"
  | "lh" | "rlh"
  | "vw" | "vh" | "vi" | "vb" | "vmin" | "vmax"
  | "svw" | "svh" | "svi" | "svb" | "svmin" | "svmax"
  | "lvw" | "lvh" | "lvi" | "lvb" | "lvmin" | "lvmax"
  | "dvw" | "dvh" | "dvi" | "dvb" | "dvmin" | "dvmax"
  | "cqw" | "cqh" | "cqi" | "cqb" | "cqmin" | "cqmax";
type LengthUnit = AbsoluteLengthUnit | RelativeLengthUnit;
const ABSOLUTE_LENGTH_UNIT_SET = new Set(["cm", "mm", "q", "in", "pc", "pt", "px"]);
const hasAbsoluteLengthUnit = (
  value: Omit<DimensionNode, "unit"> & { unit: LengthUnit },
): value is Omit<DimensionNode, "unit"> & { unit: AbsoluteLengthUnit } => {
  return ABSOLUTE_LENGTH_UNIT_SET.has(value.unit);
};

/* prettier-ignore */
const LENGTH_UNIT_SET = new Set([
  ...ABSOLUTE_LENGTH_UNIT_SET,
  "em", "ex", "cap", "ch", "ic", "rem",
  "lh", "rlh",
  "vw", "vh", "vi", "vb", "vmin", "vmax",
  "svw" , "svh" , "svi" , "svb" , "svmin" , "svmax",
  "lvw" , "lvh" , "lvi" , "lvb" , "lvmin" , "lvmax",
  "dvw" , "dvh" , "dvi" , "dvb" , "dvmin" , "dvmax",
  "cqw", "cqh", "cqi", "cqb", "cqmin", "cqmax"
]);
const isLengthUnit = (unit: string): unit is LengthUnit => {
  return LENGTH_UNIT_SET.has(unit);
};
export const compareLength = (
  a: LengthValueNode,
  b: LengthValueNode,
): "lt" | "eq" | "gt" | "unknown" => {
  const a_: Omit<DimensionNode, "unit"> & { unit: LengthUnit } =
    a._t === "number" ? { _t: "dimension", value: 0, unit: "px", start: a.start, end: b.end } : a;
  const b_: Omit<DimensionNode, "unit"> & { unit: LengthUnit } =
    b._t === "number" ? { _t: "dimension", value: 0, unit: "px", start: a.start, end: b.end } : b;

  if (hasAbsoluteLengthUnit(a_)) {
    const aPx = toPx(a_);
    if (hasAbsoluteLengthUnit(b_)) {
      const bPx = toPx(b_);
      if (aPx === bPx) return "eq";
      else if (aPx > bPx) return "gt";
      else return "lt";
    } else {
      // TODO: better static analysis, would require "gte" and "lte"
      // e.g. relative units are non negative
      if (aPx === 0 && b_.value === 0) return "eq";
      return "unknown";
    }
  } else {
    if (hasAbsoluteLengthUnit(b_)) {
      const reversed = compareLength(b_, a_);
      if (reversed === "lt") return "gt";
      else if (reversed === "gt") return "lt";
      else return reversed;
    } else {
      // TODO: better static analysis, would require "gte" and "lte"
      // e.g. min <= w,h,i,b <= max, relative units are non negative etc
      if (a_.value === 0 && b_.value === 0) return "eq";
      return "unknown";
    }
  }
};

const ABSOLUTE_LENGTH_UNIT_MAP = new Map<AbsoluteLengthUnit, number>([
  ["cm", 96 / 2.54],
  ["mm", 96 / 25.4],
  ["q", 96 / 101.6],
  ["in", 96],
  ["pc", 96 / 6],
  ["pt", 96 / 72],
]);
const toPx = (value: Omit<DimensionNode, "unit"> & { unit: AbsoluteLengthUnit }): number => {
  return value.value * (ABSOLUTE_LENGTH_UNIT_MAP.get(value.unit) ?? 1);
};

// ---

export const compareRatio = (
  a: RatioValueNode,
  b: RatioValueNode,
): "lt" | "eq" | "gt" | "incomparable" => {
  const al = a._t === "number" ? a.value : a.left;
  const ar = a._t === "number" ? 1 : a.right;
  const bl = b._t === "number" ? b.value : b.left;
  const br = b._t === "number" ? 1 : b.right;
  // test first for equality
  if (al === 0 && ar === 0) {
    return bl === 0 && br === 0 ? "eq" : "incomparable";
  } else if (bl === 0 && br === 0) {
    return "incomparable";
  } else if (al === 0 && bl === 0) {
    return "eq";
  } else if (ar === 0 && br === 0) {
    return "eq";
  } else if (al !== 0 && bl !== 0 && ar !== 0 && br !== 0 && al * br === bl * ar) {
    return "eq";
  }
  // else reduce to numbers and compare
  const a_ = al / ar;
  const b_ = bl / br;
  if (a_ > b_) {
    return "gt";
  } else if (a_ < b_) {
    return "lt";
  } else {
    return "eq";
  }
};

// ---

type ResolutionUnit = "dpi" | "dpcm" | "dppx" | "x";
const RESOLUTION_UNIT_SET = new Set(["dpi", "dpcm", "dppx", "x"]);
const isResolutionUnit = (unit: string): unit is ResolutionUnit => {
  return RESOLUTION_UNIT_SET.has(unit);
};
export const compareResolution = (
  a: ResolutionValueNode,
  b: ResolutionValueNode,
): "lt" | "eq" | "gt" => {
  const aX = toX(a);
  const bX = toX(b);
  if (aX === bX) return "eq";
  else if (aX > bX) return "gt";
  else return "lt";
};

const RESOLUTION_UNIT_MAP = new Map<ResolutionUnit, number>([
  ["dpi", 96],
  ["dpcm", 96 / 2.54],
  ["dppx", 1],
]);
const toX = (value: ResolutionValueNode): number => {
  return value.value * (RESOLUTION_UNIT_MAP.get(value.unit) ?? 1);
};
