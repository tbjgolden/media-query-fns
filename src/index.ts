import {
  toAST,
  AST,
  MediaCondition,
  MediaFeature,
  NumberToken,
  DimensionToken,
  RatioToken,
  IdentToken,
} from "media-query-parser";

type ConditionRange<T = number> = [boolean, T, T, boolean];

type Condition<T> = T | "{never}" | "{invalid}";

type FullFeatureSet = {
  "any-hover": "none" | "hover";
  "any-pointer": "none" | "coarse" | "fine";
  "color-gamut": [
    belowSrgb: boolean,
    srgbAndBelowP3: boolean,
    p3AndBelowRec2020: boolean,
    rec2020AndAbove: boolean
  ];
  grid: 0 | 1;
  hover: "none" | "hover";
  orientation: "portrait" | "landscape";
  "overflow-block": "none" | "scroll" | "paged";
  "overflow-inline": "none" | "scroll";
  pointer: "none" | "coarse" | "fine";
  scan: "interlace" | "progressive";
  update: "none" | "slow" | "fast";
  "aspect-ratio": ConditionRange<[number, number]>;
  color: ConditionRange;
  "color-index": ConditionRange;
  "device-aspect-ratio": ConditionRange<[number, number]>;
  "device-height": ConditionRange;
  "device-width": ConditionRange;
  height: ConditionRange;
  monochrome: ConditionRange;
  resolution: ConditionRange;
  width: ConditionRange;
};
type FullConditionSet = {
  [Property in keyof FullFeatureSet]: Condition<FullFeatureSet[Property]>;
} & {
  "media-type": "screen" | "print" | "not-screen" | "not-print" | "all";
  // ---
  "invalid-features": string[];
  // ---
};
type ConditionSet = Partial<FullConditionSet>;
type ConditionSets = ConditionSet[];

type StandardLengthUnit = {
  type: "dimension";
  subtype: "length";
  px: number;
};
type StandardTimeUnit = {
  type: "dimension";
  subtype: "time";
  ms: number;
};
type StandardFrequencyUnit = {
  type: "dimension";
  subtype: "frequency";
  hz: number;
};
type StandardResolutionUnit = {
  type: "dimension";
  subtype: "resolution";
  dppx: number;
};
type StandardInfiniteUnit = {
  type: "infinite";
};
type StandardIdentUnit = {
  type: "ident";
  value: string;
};
type StandardDimensionUnit =
  | StandardLengthUnit
  | StandardTimeUnit
  | StandardFrequencyUnit
  | StandardResolutionUnit
  | StandardInfiniteUnit
  | StandardIdentUnit;

type StandardNumberUnit = {
  type: "number";
  value: number;
};
type StandardRatioUnit = {
  type: "ratio";
  numerator: number;
  denominator: number;
};
type StandardUnit =
  | StandardDimensionUnit
  | StandardNumberUnit
  | StandardRatioUnit;

const DISCRETE_FEATURES = {
  "any-hover": { none: 1, hover: 1 },
  "any-pointer": { none: 1, coarse: 1, fine: 1 },
  "color-gamut": { srgb: 1, p3: 1, rec2020: 1 },
  grid: { 0: 1, 1: 1 },
  hover: { none: 1, hover: 1 },
  orientation: { portrait: 1, landscape: 1 },
  "overflow-block": { none: 1, scroll: 1, paged: 1 },
  "overflow-inline": { none: 1, scroll: 1 },
  pointer: { none: 1, coarse: 1, fine: 1 },
  scan: { interlace: 1, progressive: 1 },
  update: { none: 1, slow: 1, fast: 1 },
} as const;
const RANGE_FEATURES = {
  "aspect-ratio": {
    feature: "aspect-ratio",
    type: "ratio",
    // range: [false, 0, Infinity, false],
  },
  "device-aspect-ratio": {
    feature: "device-aspect-ratio",
    type: "ratio",
    // range: [false, 0, Infinity, false],
  },
  color: {
    feature: "color",
    type: "integer",
    // range: [true, 0, Infinity, false],
  },
  "color-index": {
    feature: "color-index",
    type: "integer",
    // range: [true, 0, Infinity, false],
  },
  monochrome: {
    feature: "monochrome",
    type: "integer",
    // range: [true, 0, Infinity, false],
  },
  "device-height": {
    feature: "device-height",
    type: "length",
    // range: [true, 0, Infinity, false],
  },
  "device-width": {
    feature: "device-width",
    type: "length",
    // range: [true, 0, Infinity, false],
  },
  height: {
    feature: "height",
    type: "length",
    // range: [true, 0, Infinity, false],
  },
  width: {
    feature: "width",
    type: "length",
    // range: [true, 0, Infinity, false],
  },
  resolution: {
    feature: "resolution",
    type: "resolution",
    // range: [true, 0, Infinity, false],
  },
} as const;

export const convertToStandardUnit = (
  token: NumberToken | DimensionToken | RatioToken | IdentToken
): StandardUnit => {
  if (token.type === "<number-token>") {
    return {
      type: "number",
      value: token.value,
    };
  } else if (token.type === "<dimension-token>") {
    /*  <length>: px
          (font relative, default 16px)
            <ch>,<ex>: 8px
            <em>,<rem>,<ic>,<lh>,<rlh>: 16px
            <cap>: 11px
          (viewport relative, default 1920×1080)
            <vh>,<vmin>,<vb>: 10.8px
            <vw>,<vmax>,<vi>: 19.2px
        <time>: ms
        <frequency>: Hz
        <resolution>: dppx */

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
      let factor: number;
      switch (token.unit) {
        case "ch":
        case "ex":
          factor = 8;
          break;
        case "em":
        case "rem":
        case "ic":
        case "lh":
        case "rlh":
          factor = 16;
          break;
        case "cm":
          factor = 37.79527559;
          break;
        case "mm":
          factor = 0.03779527559;
          break;
        case "in":
          factor = 96;
          break;
        case "q":
          factor = 0.009448818898;
          break;
        case "pc":
          factor = 16;
          break;
        case "pt":
          factor = 16;
          break;
        case "cap":
          factor = 1.333333333;
          break;
        case "vh":
        case "vmin":
        case "vb":
          factor = 10.8;
          break;
        case "vw":
        case "vmax":
        case "vi":
          factor = 19.2;
          break;
        default:
          return {
            type: "ident",
            value: "{invalid}",
          };
      }

      return {
        type: "dimension",
        subtype: "length",
        px: parseFloat((token.value * factor).toFixed(3)),
      };
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

export const andConditionSets = (
  a: ConditionSets,
  b: ConditionSets
): ConditionSets => {
  const newConditionSets: ConditionSets = [];
  for (const x of a) {
    for (const y of b) {
      const newConditionSet = mergeConditionSets(x, y);
      if (Object.keys(newConditionSet).length > 0) {
        newConditionSets.push(newConditionSet);
      }
    }
  }
  return newConditionSets;
};

export const mergeConditionSets = (
  setA: ConditionSet,
  setB: ConditionSet
): ConditionSet => {
  const output: ConditionSet = { ...setA };
  for (const k in setB) {
    const key = k as keyof FullConditionSet;
    if (key in output) {
      const A = output as FullConditionSet;
      const B = setB as FullConditionSet;
      // in both, merge
      if (key === "media-type") {
        A[key] = B[key];
      } else if (key === "invalid-features") {
        A[key].push(...B[key]);
      } else if (output[key] === "{invalid}" || setB[key] === "{invalid}") {
        A[key] = "{invalid}";
      } else if (output[key] === "{never}" || setB[key] === "{never}") {
        A[key] = "{never}";
      } else {
        const A = output as FullFeatureSet;
        const B = setB as FullFeatureSet;
        if (
          key === "any-hover" ||
          key === "any-pointer" ||
          key === "orientation" ||
          key === "overflow-block" ||
          key === "overflow-inline" ||
          key === "hover" ||
          key === "grid" ||
          key === "scan" ||
          key === "pointer" ||
          key === "update"
        ) {
          // this is type safe, but ts can't work it out
          (A as any)[key] = A[key] === B[key] ? A[key] : "{never}";
        } else if (key === "color-gamut") {
          (A as any)[key] = [
            A[key][0] && B[key][0],
            A[key][1] && B[key][1],
            A[key][2] && B[key][2],
            A[key][3] && B[key][3],
          ];
        } else {
          const [aMinInclusive, aMin, aMax, aMaxInclusive] = A[key];
          const aMinValue = typeof aMin === "number" ? aMin : aMin[0] / aMin[1];
          const aMaxValue = typeof aMax === "number" ? aMax : aMax[0] / aMax[1];
          const [bMinInclusive, bMin, bMax, bMaxInclusive] = B[key];
          const bMinValue = typeof bMin === "number" ? bMin : bMin[0] / bMin[1];
          const bMaxValue = typeof bMax === "number" ? bMax : bMax[0] / bMax[1];

          let aMinMoreThanB =
            aMinInclusive === bMinInclusive ? false : !aMinInclusive;
          if (aMinValue !== bMinValue) aMinMoreThanB = aMinValue > bMinValue;
          let aMaxLessThanB =
            aMaxInclusive === bMaxInclusive ? false : !aMaxInclusive;
          if (aMaxValue !== bMaxValue) aMaxLessThanB = aMaxValue < bMaxValue;

          const mergedMinInclusive = aMinMoreThanB
            ? aMinInclusive
            : bMinInclusive;
          const mergedMin = aMinMoreThanB ? aMin : bMin;
          const mergedMax = aMaxLessThanB ? aMax : bMax;
          const mergedMaxInclusive = aMaxLessThanB
            ? aMaxInclusive
            : bMaxInclusive;

          // this is type safe, but ts can't work it out
          (A as any)[key] = [
            mergedMinInclusive,
            mergedMin,
            mergedMax,
            mergedMaxInclusive,
          ];
        }
      }
    } else {
      // this is type safe, but ts can't work it out
      output[key] = setB[key] as any;
    }
  }
  return output;
};

export const notConditionSets = (
  conditionSets: ConditionSets
): ConditionSets => {
  // !(a || b) = !a && !b
  return conditionSets
    .map((conditionSet) => invertConditionSet(conditionSet))
    .reduce((a: ConditionSets, b: ConditionSets) => andConditionSets(a, b));
};

export const invertConditionSet = (
  conditionSet: ConditionSet
): ConditionSets => {
  let outputSets: ConditionSets = [{}];
  const {
    "media-type": mediaType,
    "invalid-features": invalidFeatures,
    ...set
  } = conditionSet;
  for (const k in set) {
    const key = k as keyof typeof set;
    if (set[key] === "{invalid}") {
      outputSets = outputSets.map((prevSet) => ({
        ...prevSet,
        [key]: "{invalid}",
      }));
    } else if (set[key] === "{never}") {
      // do not add key (effectively removing it from result set)
    } else if (key in DISCRETE_FEATURES) {
      const dKey = key as keyof typeof DISCRETE_FEATURES;
      const dSet = set as FullFeatureSet;
      if (dKey === "color-gamut") {
        const prevGamutRange = dSet["color-gamut"];
        outputSets = outputSets.map((set) => ({
          ...set,
          "color-gamut": [
            !prevGamutRange[0],
            !prevGamutRange[1],
            !prevGamutRange[2],
            !prevGamutRange[3],
          ],
        }));
      } else if (dKey === "grid") {
        const before = dSet[dKey];
        outputSets = outputSets.map((prevSet) => ({
          ...prevSet,
          grid: before === 0 ? 1 : 0,
        }));
      } else {
        const values = Object.keys(DISCRETE_FEATURES[dKey]);
        const before = dSet[dKey];
        outputSets = outputSets.flatMap((prevSet) =>
          values.reduce((sets: ConditionSets, next) => {
            if (next !== before) {
              sets.push({
                ...prevSet,
                [dKey]: next,
              });
            }
            return sets;
          }, [])
        );
      }
    } else if (key in RANGE_FEATURES) {
      const rKey = key as keyof typeof RANGE_FEATURES;
      const rSet = set as FullFeatureSet;
      const [minInclusive, min, max, maxInclusive] = rSet[rKey];
      const isMinBounded = min !== -Infinity || !minInclusive;
      const isMaxBounded = max !== Infinity || !maxInclusive;
      if (isMinBounded && isMaxBounded) {
        outputSets = outputSets.flatMap((set) => [
          {
            ...set,
            [rKey]: [true, -Infinity, min, !minInclusive],
          },
          {
            ...set,
            [rKey]: [!maxInclusive, max, Infinity, true],
          },
        ]);
      } else if (!isMinBounded && !isMaxBounded) {
        outputSets = outputSets.map((set) => ({
          ...set,
          [rKey]: "{never}",
        }));
      } else {
        if (isMinBounded) {
          outputSets = outputSets.map((set) => ({
            ...set,
            [rKey]: [true, -Infinity, min, !minInclusive],
          }));
        } else {
          outputSets = outputSets.map((set) => ({
            ...set,
            [rKey]: [!maxInclusive, max, Infinity, true],
          }));
        }
      }
    }
  }
  // TODO: add mediaType and invalidFeatures
  return outputSets;
};

export const mediaFeatureToConditionSets = (
  mediaFeature: MediaFeature
): ConditionSets | string => {
  let minValue: StandardUnit | null = null;
  let minInclusive = true;
  let maxValue: StandardUnit | null = null;
  let maxInclusive = true;

  if (mediaFeature.context === "range") {
    if (mediaFeature.range.leftToken !== null) {
      const { leftToken, leftOp } = mediaFeature.range;
      const value = convertToStandardUnit(leftToken);
      if (leftOp === "<" || leftOp === "<=") {
        minValue = value;
        minInclusive = leftOp === "<=";
      } else if (leftOp === ">" || leftOp === ">=") {
        maxValue = value;
        maxInclusive = leftOp === ">=";
      } else {
        minValue = value;
        maxValue = value;
        minInclusive = true;
        maxInclusive = true;
      }
    }
    if (mediaFeature.range.rightToken !== null) {
      const { rightToken, rightOp } = mediaFeature.range;
      const value = convertToStandardUnit(rightToken);
      if (rightOp === "<" || rightOp === "<=") {
        maxValue = value;
        maxInclusive = rightOp === "<=";
      } else if (rightOp === ">" || rightOp === ">=") {
        minValue = value;
        minInclusive = rightOp === ">=";
      } else {
        minValue = value;
        maxValue = value;
        minInclusive = true;
        maxInclusive = true;
      }
    }
  } else if (mediaFeature.context === "value") {
    const value = convertToStandardUnit(mediaFeature.value);
    if (mediaFeature.prefix === "min") {
      minValue = value;
      minInclusive = true;
    } else if (mediaFeature.prefix === "max") {
      maxValue = value;
      maxInclusive = true;
    } else {
      minValue = value;
      maxValue = value;
      minInclusive = true;
      maxInclusive = true;
    }
  }

  if (
    !(mediaFeature.feature in DISCRETE_FEATURES) &&
    !(mediaFeature.feature in RANGE_FEATURES)
  ) {
    return mediaFeature.feature;
  }

  if (mediaFeature.context === "boolean") {
    const feature = mediaFeature.feature as keyof FullFeatureSet;
    if (feature === "color-gamut") {
      // colorGamut has no 'none' value, but treats srgb as truthy
      return [
        {
          "color-gamut": [false, true, true, true],
        },
      ];
    } else if (feature === "grid") {
      return [
        {
          grid: 1,
        },
      ];
    } else if (
      feature === "any-hover" ||
      feature === "any-pointer" ||
      feature === "hover" ||
      feature === "orientation" ||
      feature === "overflow-block" ||
      feature === "overflow-inline" ||
      feature === "pointer" ||
      feature === "scan" ||
      feature === "update"
    ) {
      return invertConditionSet({
        [feature]: "none",
      });
    } else if (
      feature === "aspect-ratio" ||
      feature === "device-aspect-ratio"
    ) {
      return [
        {
          [feature]: [true, [-Infinity, 1], [0, 1], false],
        },
        {
          [feature]: [false, [0, 1], [Infinity, 1], true],
        },
      ];
    } else {
      /* feature === "color" ||
         feature === "color-index" ||
         feature === "monochrome" ||
         feature === "device-height" ||
         feature === "device-width" ||
         feature === "height" ||
         feature === "width" */
      return [
        {
          [feature]: [true, -Infinity, 0, false],
        },
        {
          [feature]: [false, 0, Infinity, true],
        },
      ];
    }
  } else if (mediaFeature.feature in DISCRETE_FEATURES) {
    const feature = mediaFeature.feature as keyof typeof DISCRETE_FEATURES;
    if (minValue === null || maxValue === null || minValue !== maxValue) {
      return [
        {
          [feature]: "{invalid}",
        },
      ];
    }
    const unit = minValue;
    if (
      unit.type === "infinite" ||
      unit.type === "dimension" ||
      unit.type === "ratio"
    ) {
      return [
        {
          [feature]: "{invalid}",
        },
      ];
    } else if (unit.type === "number") {
      if (feature !== "grid" || (unit.value !== 0 && unit.value !== 1)) {
        return [{ grid: "{invalid}" }];
      } else {
        return [
          {
            grid: unit.value,
          },
        ];
      }
    } else {
      // unit.type === "ident"
      return [
        {
          [feature]:
            unit.value in DISCRETE_FEATURES[feature] ? unit.value : "{invalid}",
        },
      ];
    }
  } else {
    // mediaFeature.feature in RANGE_FEATURES
    const featureData =
      RANGE_FEATURES[mediaFeature.feature as keyof typeof RANGE_FEATURES];
    if (featureData.type === "resolution") {
      let safeMinValue: number | null | false = null;
      let safeMaxValue: number | null | false = null;
      if (minValue !== null) {
        if (
          minValue.type === "dimension" &&
          minValue.subtype === "resolution"
        ) {
          safeMinValue = minValue.dppx;
        } else if (minValue.type === "infinite") {
          safeMinValue = Infinity;
        } else {
          safeMinValue = false;
        }
      }
      if (maxValue !== null) {
        if (
          maxValue.type === "dimension" &&
          maxValue.subtype === "resolution"
        ) {
          safeMaxValue = maxValue.dppx;
        } else if (maxValue.type === "infinite") {
          safeMaxValue = Infinity;
        } else {
          safeMaxValue = false;
        }
      }
      if (safeMinValue === false || safeMaxValue === false) {
        return [
          {
            resolution: "{invalid}",
          },
        ];
      } else if (safeMinValue === null) {
        return [
          {
            resolution: [
              true,
              -Infinity,
              safeMaxValue as Exclude<typeof safeMaxValue, null>,
              maxInclusive,
            ],
          },
        ];
      } else if (safeMaxValue === null) {
        return [
          {
            resolution: [
              minInclusive,
              safeMinValue as Exclude<typeof safeMinValue, null>,
              Infinity,
              true,
            ],
          },
        ];
      } else {
        if (
          safeMinValue > safeMaxValue ||
          (safeMinValue === safeMaxValue && minInclusive && maxInclusive)
        ) {
          return [
            {
              resolution: "{never}",
            },
          ];
        } else {
          return [
            {
              resolution: [
                minInclusive,
                safeMinValue,
                safeMaxValue,
                maxInclusive,
              ],
            },
          ];
        }
      }
    } else if (featureData.type === "ratio") {
      const { feature } = featureData;
      let safeMinValue: [number, number] | null | false = null;
      let safeMaxValue: [number, number] | null | false = null;
      if (minValue !== null) {
        safeMinValue =
          minValue.type === "ratio"
            ? [minValue.numerator, minValue.denominator]
            : false;
      }
      if (maxValue !== null) {
        safeMaxValue =
          maxValue.type === "ratio"
            ? [maxValue.numerator, maxValue.denominator]
            : false;
      }
      if (safeMinValue === false || safeMaxValue === false) {
        return [{ [feature]: "{invalid}" }];
      } else if (safeMinValue === null) {
        return [
          {
            [feature]: [
              true,
              [-Infinity, 1],
              safeMaxValue as Exclude<typeof safeMaxValue, null>,
              maxInclusive,
            ],
          },
        ];
      } else if (safeMaxValue === null) {
        return [
          {
            [feature]: [
              minInclusive,
              safeMinValue as Exclude<typeof safeMinValue, null>,
              [Infinity, 1],
              true,
            ],
          },
        ];
      } else {
        if (
          safeMinValue > safeMaxValue ||
          (safeMinValue === safeMaxValue && minInclusive && maxInclusive)
        ) {
          return [
            {
              resolution: "{never}",
            },
          ];
        } else {
          return [
            {
              [feature]: [
                minInclusive,
                safeMinValue,
                safeMaxValue,
                maxInclusive,
              ],
            },
          ];
        }
      }
    } else if (featureData.type === "integer") {
      const { feature } = featureData;
      let safeMinValue: number | null | false = null;
      let safeMaxValue: number | null | false = null;
      if (minValue !== null) {
        safeMinValue = minValue.type === "number" ? minValue.value : false;
      }
      if (maxValue !== null) {
        safeMaxValue = maxValue.type === "number" ? maxValue.value : false;
      }
      if (
        safeMinValue === false ||
        safeMaxValue === false ||
        !Number.isInteger(safeMinValue) ||
        !Number.isInteger(safeMaxValue)
      ) {
        return [{ [feature]: "{invalid}" }];
      } else if (safeMinValue === null) {
        return [
          {
            [feature]: [
              true,
              -Infinity,
              safeMaxValue as Exclude<typeof safeMaxValue, null>,
              maxInclusive,
            ],
          },
        ];
      } else if (safeMaxValue === null) {
        return [
          {
            [feature]: [
              minInclusive,
              safeMinValue as Exclude<typeof safeMinValue, null>,
              Infinity,
              true,
            ],
          },
        ];
      } else {
        if (
          safeMinValue > safeMaxValue ||
          (safeMinValue === safeMaxValue && minInclusive && maxInclusive)
        ) {
          return [
            {
              resolution: "{never}",
            },
          ];
        } else {
          return [
            {
              [feature]: [
                minInclusive,
                safeMinValue,
                safeMaxValue,
                maxInclusive,
              ],
            },
          ];
        }
      }
    } else {
      // featureData.type === "length"
      const { feature } = featureData;
      let safeMinValue: number | null | false = null;
      let safeMaxValue: number | null | false = null;
      if (minValue !== null) {
        if (minValue.type === "number") {
          safeMinValue = minValue.value === 0 ? 0 : false;
        } else {
          safeMinValue =
            minValue.type === "dimension" && minValue.subtype === "length"
              ? minValue.px
              : false;
        }
      }
      if (maxValue !== null) {
        if (maxValue.type === "number") {
          safeMaxValue = maxValue.value === 0 ? 0 : false;
        } else {
          safeMaxValue =
            maxValue.type === "dimension" && maxValue.subtype === "length"
              ? maxValue.px
              : false;
        }
      }
      if (safeMinValue === false || safeMaxValue === false) {
        return [{ [feature]: "{invalid}" }];
      } else if (safeMinValue === null) {
        return [
          {
            [feature]: [
              true,
              -Infinity,
              safeMaxValue as Exclude<typeof safeMaxValue, null>,
              maxInclusive,
            ],
          },
        ];
      } else if (safeMaxValue === null) {
        return [
          {
            [feature]: [
              minInclusive,
              safeMinValue as Exclude<typeof safeMinValue, null>,
              Infinity,
              true,
            ],
          },
        ];
      } else {
        if (
          safeMinValue > safeMaxValue ||
          (safeMinValue === safeMaxValue && minInclusive && maxInclusive)
        ) {
          return [
            {
              resolution: "{never}",
            },
          ];
        } else {
          return [
            {
              [feature]: [
                minInclusive,
                safeMinValue,
                safeMaxValue,
                maxInclusive,
              ],
            },
          ];
        }
      }
    }
  }
};

export const mediaConditionToConditionSets = (
  mediaCondition: MediaCondition
): ConditionSets => {
  const conditionSetsSets: ConditionSet[][] = [];
  for (const child of mediaCondition.children) {
    if ("context" in child) {
      const result = mediaFeatureToConditionSets(child);
      if (typeof result === "string") {
        conditionSetsSets.push([
          {
            "invalid-features": [result],
          },
        ]);
      } else {
        conditionSetsSets.push(result);
      }
    } else {
      conditionSetsSets.push(mediaConditionToConditionSets(child));
    }
  }
  if (mediaCondition.operator === "or" || mediaCondition.operator === null) {
    return conditionSetsSets.flat();
  } else if (mediaCondition.operator === "and") {
    return conditionSetsSets.reduce((a, b) => andConditionSets(a, b));
  } else {
    // "not"
    return notConditionSets(conditionSetsSets[0]);
  }
};

export const astToConditionSets = (ast: AST): ConditionSets => {
  const allConditions: ConditionSet[] = [];

  for (const mediaQuery of ast) {
    let mediaType: FullConditionSet["media-type"] = "all";
    if (mediaQuery.mediaType === "print") {
      mediaType = mediaQuery.mediaPrefix === "not" ? "not-print" : "print";
    } else if (mediaQuery.mediaType === "screen") {
      mediaType = mediaQuery.mediaPrefix === "not" ? "not-screen" : "screen";
    }

    if (mediaQuery.mediaCondition === null) {
      allConditions.push({
        "media-type": mediaType,
      });
    } else if (mediaQuery.mediaPrefix === "not") {
      allConditions.push(
        ...mediaConditionToConditionSets(mediaQuery.mediaCondition).flatMap(
          (conditionSet) =>
            invertConditionSet(conditionSet).map((inverted) => ({
              ...inverted,
              "media-type": mediaType,
            }))
        )
      );
    } else {
      allConditions.push(
        ...mediaConditionToConditionSets(mediaQuery.mediaCondition).map(
          (conditionSet) => ({
            ...conditionSet,
            "media-type": mediaType,
          })
        )
      );
    }
  }

  return allConditions;
};

export const queryToConditionSets = (query: string): ConditionSets => {
  const ast = toAST(query);
  if (ast === null) {
    throw new Error("Query string was not lexed due to a syntax error");
  }
  return astToConditionSets(ast);
};
