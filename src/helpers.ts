// import util from "util";
// export const log = (x: unknown) =>
//   console.log(
//     util.inspect(x, {
//       depth: 10,
//       colors: true,
//     })
//   );
export const log = (x: unknown) => console.log(JSON.stringify(x, null, 2));

type Values<T> = T[keyof T];
type KVPairs<T> = Values<{
  [Property in keyof T]: [Property, T[Property]];
}>;
export type ConditionRange<T = number> = readonly [boolean, T, T, boolean];
export type Condition<T> = T | "{false}" | "{true}";
export type Conditional<T> = {
  [Property in keyof T]: Condition<T[Property]>;
};

export type DiscreteFeatures = {
  "any-hover": "none" | "hover";
  "any-pointer": "none" | "coarse" | "fine";
  "color-gamut": readonly [
    belowSrgb: boolean,
    srgbAndBelowP3: boolean,
    p3AndBelowRec2020: boolean,
    rec2020AndAbove: boolean
  ];
  grid: 0 | 1;
  hover: "none" | "hover";
  "overflow-block": "none" | "scroll" | "paged";
  "overflow-inline": "none" | "scroll";
  pointer: "none" | "coarse" | "fine";
  scan: "interlace" | "progressive";
  update: "none" | "slow" | "fast";
};
export type RangeRatioFeatures = {
  "aspect-ratio": ConditionRange<readonly [number, number]>;
  "device-aspect-ratio": ConditionRange<readonly [number, number]>;
};
export type RangeNumberFeatures = {
  color: ConditionRange;
  "color-index": ConditionRange;
  "device-height": ConditionRange;
  "device-width": ConditionRange;
  height: ConditionRange;
  monochrome: ConditionRange;
  resolution: ConditionRange;
  width: ConditionRange;
};
export type RangeFeatures = RangeRatioFeatures & RangeNumberFeatures;
export type MediaFeatures = DiscreteFeatures & RangeFeatures;
export type Perm = Partial<
  Conditional<MediaFeatures> & {
    "media-type":
      | "screen"
      | "print"
      | "not-screen"
      | "not-print"
      | "all"
      | "{false}";
    "invalid-features": string[];
  }
>;
export type ConditionPair = KVPairs<Required<Perm>>;
export type DiscreteConditionPair = KVPairs<Conditional<DiscreteFeatures>>;
export type RangeConditionPair = KVPairs<Conditional<RangeFeatures>>;
export type RangeRatioConditionPair = KVPairs<Conditional<RangeRatioFeatures>>;
export type RangeNumberConditionPair = KVPairs<
  Conditional<RangeNumberFeatures>
>;

export const permToConditionPairs = (perm: Perm): ConditionPair[] => {
  return Object.entries(perm).filter(
    (pair) => pair[1] !== undefined
  ) as ConditionPair[];
};

// prettier-ignore
const DISCRETE_KEYS = new Set([
  "any-hover", "any-pointer", "color-gamut", "grid", "hover",
  "overflow-block", "overflow-inline", "pointer", "scan", "update"
]);
export const hasDiscreteKey = (
  pair: ConditionPair
): pair is DiscreteConditionPair => DISCRETE_KEYS.has(pair[0]);
export const isDiscreteKey = (key: string): key is keyof DiscreteFeatures =>
  DISCRETE_KEYS.has(key);

const RANGE_RATIO_KEYS = new Set(["aspect-ratio", "device-aspect-ratio"]);
export const hasRangeRatioKey = (
  pair: ConditionPair
): pair is RangeRatioConditionPair => RANGE_RATIO_KEYS.has(pair[0]);
export const isRangeRatioKey = (key: string): key is keyof RangeRatioFeatures =>
  RANGE_RATIO_KEYS.has(key);

// prettier-ignore
const RANGE_NUMBER_KEYS = new Set([
  "color", "color-index", "device-height", "device-width",
  "height", "monochrome", "resolution", "width",
]);
export const hasRangeNumberKey = (
  pair: ConditionPair
): pair is RangeNumberConditionPair => RANGE_NUMBER_KEYS.has(pair[0]);
export const isRangeNumberKey = (
  key: string
): key is keyof RangeNumberFeatures => RANGE_NUMBER_KEYS.has(key);

export const hasRangeKey = (pair: ConditionPair): pair is RangeConditionPair =>
  hasRangeNumberKey(pair) || hasRangeRatioKey(pair);
export const isRangeKey = (key: string): key is keyof RangeNumberFeatures =>
  isRangeNumberKey(key) || isRangeRatioKey(key);

// prettier-ignore
const PERM_KEYS = new Set([
  "any-hover", "any-pointer", "color-gamut", "grid", "hover",
  "overflow-block", "overflow-inline", "pointer", "scan", "update",
  "aspect-ratio", "color", "color-index", "device-aspect-ratio",
  "device-height", "device-width", "height", "monochrome", "resolution",
  "width", "media-type", "invalid-features",
]);
export const isPermKey = (key: string): key is keyof Perm => PERM_KEYS.has(key);
export const isFeatureKey = (key: string): key is keyof MediaFeatures =>
  isRangeNumberKey(key) || isRangeRatioKey(key) || isDiscreteKey(key);

export const DISCRETE_FEATURES = {
  "any-hover": { none: 1, hover: 1 },
  "any-pointer": { none: 1, coarse: 1, fine: 1 },
  "color-gamut": { srgb: 1, p3: 1, rec2020: 1 },
  grid: { 0: 1, 1: 1 },
  hover: { none: 1, hover: 1 },
  "overflow-block": { none: 1, scroll: 1, paged: 1 },
  "overflow-inline": { none: 1, scroll: 1 },
  pointer: { none: 1, coarse: 1, fine: 1 },
  scan: { interlace: 1, progressive: 1 },
  update: { none: 1, slow: 1, fast: 1 },
} as const;

export const RANGE_NUMBER_FEATURES = {
  color: {
    feature: "color",
    type: "integer",
    bounds: [true, 0, Infinity, false],
  },
  "color-index": {
    feature: "color-index",
    type: "integer",
    bounds: [true, 0, Infinity, false],
  },
  monochrome: {
    feature: "monochrome",
    type: "integer",
    bounds: [true, 0, Infinity, false],
  },
  "device-height": {
    feature: "device-height",
    type: "length",
    bounds: [true, 0, Infinity, false],
  },
  "device-width": {
    feature: "device-width",
    type: "length",
    bounds: [true, 0, Infinity, false],
  },
  height: {
    feature: "height",
    type: "length",
    bounds: [true, 0, Infinity, false],
  },
  width: {
    feature: "width",
    type: "length",
    bounds: [true, 0, Infinity, false],
  },
  resolution: {
    feature: "resolution",
    type: "resolution",
    bounds: [true, 0, Infinity, false],
  },
} as const;

export const RANGE_RATIO_FEATURES = {
  "aspect-ratio": {
    feature: "aspect-ratio",
    type: "ratio",
    bounds: [false, [0, 1], [Infinity, 1], false],
  },
  "device-aspect-ratio": {
    feature: "device-aspect-ratio",
    type: "ratio",
    bounds: [false, [0, 1], [Infinity, 1], false],
  },
} as const;

export const attachPair = <T extends object>(
  obj: T,
  pair: ConditionPair
): void => {
  (obj as any)[pair[0]] = pair[1];
};

const binaryAndRanges = <T extends number | readonly [number, number]>(
  a: ConditionRange<T>,
  b: ConditionRange<T>
): ConditionRange<T> | "{false}" => {
  const [aMinInclusive, aMin, aMax, aMaxInclusive] = a;
  const aMinValue = typeof aMin === "number" ? aMin : aMin[0] / aMin[1];
  const aMaxValue = typeof aMax === "number" ? aMax : aMax[0] / aMax[1];
  const [bMinInclusive, bMin, bMax, bMaxInclusive] = b;
  const bMinValue = typeof bMin === "number" ? bMin : bMin[0] / bMin[1];
  const bMaxValue = typeof bMax === "number" ? bMax : bMax[0] / bMax[1];

  let aMinMoreThanB = aMinInclusive === bMinInclusive ? false : !aMinInclusive;
  if (aMinValue !== bMinValue) aMinMoreThanB = aMinValue > bMinValue;
  let aMaxLessThanB = aMaxInclusive === bMaxInclusive ? false : !aMaxInclusive;
  if (aMaxValue !== bMaxValue) aMaxLessThanB = aMaxValue < bMaxValue;

  const mergedMinInclusive = aMinMoreThanB ? aMinInclusive : bMinInclusive;
  const mergedMin = aMinMoreThanB ? aMin : bMin;
  const mergedMax = aMaxLessThanB ? aMax : bMax;
  const mergedMaxInclusive = aMaxLessThanB ? aMaxInclusive : bMaxInclusive;

  if (
    mergedMin > mergedMax ||
    (mergedMin === mergedMax && !(mergedMinInclusive && mergedMaxInclusive))
  ) {
    return "{false}";
  } else {
    return [mergedMinInclusive, mergedMin, mergedMax, mergedMaxInclusive];
  }
};

export const andRanges = <T extends number | readonly [number, number]>(
  ...ranges: Array<"{true}" | "{false}" | ConditionRange<T>>
): "{true}" | "{false}" | ConditionRange<T> =>
  ranges.reduce((a, b) => {
    if (a === "{true}") {
      return b;
    } else if (b === "{true}") {
      return a;
    } else if (a === "{false}" || b === "{false}") {
      return "{false}";
    } else {
      return binaryAndRanges(a, b);
    }
  }, "{true}");

export const boundRange = <T extends RangeConditionPair>(pair: T): T[1] => {
  if (hasRangeRatioKey(pair)) {
    const { bounds } = RANGE_RATIO_FEATURES[pair[0]];
    const newBounds = andRanges(pair[1], bounds);
    if (typeof newBounds === "string") {
      return newBounds;
    } else if (
      newBounds[0] === bounds[0] &&
      newBounds[1][0] === bounds[1][0] &&
      newBounds[1][1] === bounds[1][1] &&
      newBounds[2][0] === bounds[2][0] &&
      newBounds[2][1] === bounds[2][1] &&
      newBounds[3] === bounds[3]
    ) {
      return "{true}";
    } else {
      return newBounds;
    }
  } else {
    const { bounds } = RANGE_NUMBER_FEATURES[pair[0]];
    const newBounds = andRanges(pair[1], bounds);
    if (typeof newBounds === "string") {
      return newBounds;
    } else if (
      newBounds[0] === bounds[0] &&
      newBounds[1] === bounds[1] &&
      newBounds[2] === bounds[2] &&
      newBounds[3] === bounds[3]
    ) {
      return "{true}";
    } else {
      return newBounds;
    }
  }
};

export const binaryOrRanges = <T extends number | readonly [number, number]>(
  a: ConditionRange<T>,
  b: ConditionRange<T>
): ConditionRange<T>[] => {
  const [aMinInclusive, aMin, aMax, aMaxInclusive] = a;
  const aMinValue = typeof aMin === "number" ? aMin : aMin[0] / aMin[1];
  const aMaxValue = typeof aMax === "number" ? aMax : aMax[0] / aMax[1];
  const [bMinInclusive, bMin, bMax, bMaxInclusive] = b;
  const bMinValue = typeof bMin === "number" ? bMin : bMin[0] / bMin[1];
  const bMaxValue = typeof bMax === "number" ? bMax : bMax[0] / bMax[1];

  let rangesOverlap = false;
  if (aMinValue < bMinValue || (aMinValue === bMinValue && aMinInclusive)) {
    // aMin lower or same
    rangesOverlap =
      bMinValue < aMaxValue ||
      (bMinValue === aMaxValue && (bMinInclusive || aMaxInclusive));
  } else {
    // bMin lower
    rangesOverlap =
      aMinValue < bMaxValue ||
      (aMinValue === bMaxValue && (aMinInclusive || bMaxInclusive));
  }

  if (rangesOverlap) {
    const minMin = aMinValue < bMinValue ? aMin : bMin;
    let minMinInclusive = aMinInclusive || bMinInclusive;
    if (aMinValue > bMinValue) minMinInclusive = bMinInclusive;
    else if (aMinValue < bMinValue) minMinInclusive = aMinInclusive;

    const maxMax = aMaxValue < bMaxValue ? aMax : bMax;
    let maxMaxInclusive = aMaxInclusive || bMaxInclusive;
    if (aMaxValue > bMaxValue) maxMaxInclusive = aMaxInclusive;
    else if (aMaxValue < bMaxValue) maxMaxInclusive = bMaxInclusive;

    return [[minMinInclusive, minMin, maxMax, maxMaxInclusive]];
  } else {
    return [a, b];
  }
};

export const notRatioRange = (
  pair: RangeRatioConditionPair
): ConditionRange<readonly [number, number]>[] | "{false}" => {
  if (typeof pair[1] === "string") throw new Error("expected range");

  const { bounds } = RANGE_RATIO_FEATURES[pair[0]];
  const [minInclusive, min, max, maxInclusive] = pair[1];
  const minValue = min[0] / min[1];
  const maxValue = max[0] / max[1];

  const minBoundValue = bounds[1][0] / bounds[1][1];
  const minBoundInclusive = bounds[0];
  const maxBoundValue = bounds[2][0] / bounds[2][1];
  const maxBoundInclusive = bounds[3];

  const isUnboundedAtBottom =
    minValue < minBoundValue ||
    (minValue === minBoundValue && !(minBoundInclusive && !minInclusive));
  const isUnboundedAtTop =
    maxValue > maxBoundValue ||
    (maxValue === maxBoundValue && !(maxBoundInclusive && !maxInclusive));

  if (isUnboundedAtBottom) {
    if (isUnboundedAtTop) return "{false}";
    else return [[!maxInclusive, max, bounds[2], bounds[3]]];
  } else if (isUnboundedAtTop) {
    return [[bounds[0], bounds[1], min, !minInclusive]];
  } else {
    return [
      [bounds[0], bounds[1], min, !minInclusive],
      [!maxInclusive, max, bounds[2], bounds[3]],
    ];
  }
};

export function notNumberRange(
  pair: RangeNumberConditionPair
): ConditionRange[] | "{false}" {
  if (typeof pair[1] === "string") throw new Error("expected range");

  const { bounds } = RANGE_NUMBER_FEATURES[pair[0]];
  const [minInclusive, min, max, maxInclusive] = pair[1];
  const minBoundValue = bounds[1];
  const minBoundInclusive = bounds[0];
  const maxBoundValue = bounds[2];
  const maxBoundInclusive = bounds[3];

  const isUnboundedAtBottom =
    min < minBoundValue ||
    (min === minBoundValue && !(minBoundInclusive && !minInclusive));
  const isUnboundedAtTop =
    max > maxBoundValue ||
    (max === maxBoundValue && !(maxBoundInclusive && !maxInclusive));

  if (isUnboundedAtBottom) {
    if (isUnboundedAtTop) return "{false}";
    else return [[!maxInclusive, max, bounds[2], bounds[3]]];
  } else if (isUnboundedAtTop) {
    return [[bounds[0], bounds[1], min, !minInclusive]];
  } else {
    return [
      [bounds[0], bounds[1], min, !minInclusive],
      [!maxInclusive, max, bounds[2], bounds[3]],
    ];
  }
}
