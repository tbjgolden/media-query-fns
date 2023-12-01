import { RatioNode, ValueNode } from "media-query-parser";

type IntegerValue = { n: "number"; v: number; isInt: true };
type LengthValue =
  | { n: "number"; v: 0; isInt: true }
  | { n: "dimension"; v: number; u: LengthUnit };
type ResolutionValue = { n: "dimension"; v: number; u: ResolutionUnit };
type RatioValue = IntegerValue | RatioNode;

// ---

export const isValueInteger = (value: ValueNode): value is IntegerValue => {
  return value.n === "number" && value.isInt;
};
export const isValueLength = (value: ValueNode): value is LengthValue => {
  return (
    (value.n === "dimension" && isLengthUnit(value.u)) ||
    (value.n === "number" && value.isInt && value.v === 0)
  );
};
export const isValueResolution = (value: ValueNode): value is ResolutionValue => {
  return value.n === "dimension" && isResolutionUnit(value.u);
};
export const isValueRatio = (value: ValueNode): value is RatioValue => {
  return value.n === "ratio" || (isValueInteger(value) && value.v >= 0);
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
const hasAbsoluteLengthUnit = (value: {
  n: "dimension";
  v: number;
  u: LengthUnit;
}): value is { n: "dimension"; v: number; u: AbsoluteLengthUnit } => {
  return ABSOLUTE_LENGTH_UNIT_SET.has(value.u);
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
export const compareLength = (a: LengthValue, b: LengthValue): "lt" | "eq" | "gt" | "unknown" => {
  const a_: { n: "dimension"; v: number; u: LengthUnit } =
    a.n === "number" ? { n: "dimension", v: 0, u: "px" } : a;
  const b_: { n: "dimension"; v: number; u: LengthUnit } =
    b.n === "number" ? { n: "dimension", v: 0, u: "px" } : b;

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
      if (aPx === 0 && b_.v === 0) return "eq";
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
      if (a_.v === 0 && b_.v === 0) return "eq";
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
const toPx = (value: { n: "dimension"; v: number; u: AbsoluteLengthUnit }): number => {
  return value.v * (ABSOLUTE_LENGTH_UNIT_MAP.get(value.u) ?? 1);
};

// ---

export const compareRatio = (a: RatioValue, b: RatioValue): "lt" | "eq" | "gt" | "incomparable" => {
  const al = a.n === "number" ? a.v : a.l;
  const ar = a.n === "number" ? 1 : a.r;
  const bl = b.n === "number" ? b.v : b.l;
  const br = b.n === "number" ? 1 : b.r;
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
export const compareResolution = (a: ResolutionValue, b: ResolutionValue): "lt" | "eq" | "gt" => {
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
const toX = (value: ResolutionValue): number => {
  return value.v * (RESOLUTION_UNIT_MAP.get(value.u) ?? 1);
};
