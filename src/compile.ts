import { toAST, AST, MediaCondition, MediaFeature } from "media-query-parser";
import util from "util";
import {
  CompiledUnitConversions,
  compileStaticUnitConversions,
  convertToUnit,
  Unit,
  UnitConversions,
} from "./units";

const log = (x: any) =>
  console.log(
    util.inspect(x, {
      depth: 10,
      colors: true,
    })
  );

export type ConditionRange<T = number> = [boolean, T, T, boolean];
export type Condition<T> = T | "{false}" | "{true}" | "{invalid}";
export type Conditional<T> = {
  [Property in keyof T]: Condition<T[Property]>;
};

export type MediaFeatures = {
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

export type FullPerm = Conditional<MediaFeatures> & {
  "media-type":
    | "screen"
    | "print"
    | "not-screen"
    | "not-print"
    | "all"
    | "{false}";
  "invalid-features": string[];
};
export type Perm = Partial<FullPerm>;
export type Perms = Perm[];

export type SimplePerm = Partial<
  MediaFeatures & {
    "media-type": "screen" | "print" | "not-screen" | "not-print";
  }
>;

export type EvaluateResult = {
  simplePerms: SimplePerm[];
  invalidFeatures: string[];
  falseFeatures: string[];
};

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
export const RANGE_FEATURES = {
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

export const andPerms = (a: Perms, b: Perms): Perms => {
  const newPerms: Perms = [];
  for (const x of a) {
    for (const y of b) {
      const newPerm = mergePerms(x, y);
      if (Object.keys(newPerm).length > 0) {
        newPerms.push(newPerm);
      }
    }
  }
  return newPerms;
};

export const mergePerms = (setA: Perm, setB: Perm): Perm => {
  const output: Perm = { ...setA };
  for (const k in setB) {
    const key = k as keyof FullPerm;
    if (key in output) {
      const A = output as FullPerm;
      const B = setB as FullPerm;
      // in both, merge
      if (key === "media-type") {
        A[key] = B[key];
      } else if (key === "invalid-features") {
        A[key].push(...B[key]);
      } else if (output[key] === "{invalid}" || setB[key] === "{invalid}") {
        A[key] = "{invalid}";
      } else if (output[key] === "{false}" || setB[key] === "{false}") {
        A[key] = "{false}";
      } else if (output[key] === "{true}") {
        A[key] = B[key] as any;
      } else if (setB[key] === "{true}") {
        // nothing, A[key] doesn't change
      } else {
        const A = output as any;
        const B = setB as any;
        if (
          key === "any-hover" ||
          key === "any-pointer" ||
          key === "overflow-block" ||
          key === "overflow-inline" ||
          key === "hover" ||
          key === "grid" ||
          key === "scan" ||
          key === "pointer" ||
          key === "update"
        ) {
          // this is type safe, but ts can't work it out
          (A as any)[key] = A[key] === B[key] ? A[key] : "{false}";
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

export const notPerms = (conditionSets: Perms): Perms => {
  // !(a || b) = !a && !b
  return conditionSets
    .map((conditionSet) => invertPerm(conditionSet))
    .reduce((a: Perms, b: Perms) => andPerms(a, b));
};

export const invertPerm = (set: Perm): Perms => {
  log("invert");
  log(set);
  if (Object.keys(set).length === 0) {
    return [];
  } else {
    let outputSets: Perms = [{}];
    for (const k in set) {
      const key = k as keyof typeof set;
      if (key === "invalid-features") {
        outputSets = outputSets.map((prevSet) => ({
          ...prevSet,
          "invalid-features": set[key],
        }));
      } else if (key === "media-type") {
        // ignore
      } else if (set[key] === "{invalid}") {
        outputSets = outputSets.map((prevSet) => ({
          ...prevSet,
          [key]: "{invalid}",
        }));
      } else if (set[key] === "{false}") {
        outputSets = outputSets.map((prevSet) => ({
          ...prevSet,
          [key]: "{true}",
        }));
      } else if (set[key] === "{true}") {
        outputSets = outputSets.map((prevSet) => ({
          ...prevSet,
          [key]: "{false}",
        }));
      } else if (key in DISCRETE_FEATURES) {
        const dKey = key as keyof typeof DISCRETE_FEATURES;
        const dSet = set as any;
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
            values.reduce((sets: Perms, next) => {
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
        if (key === "aspect-ratio" || key === "device-aspect-ratio") {
          const rSet = set as any;
          const [minInclusive, n, x, maxInclusive] = rSet[key];
          const min = n[0] / n[1];
          const max = x[0] / x[1];
          const isMinBounded = min !== -Infinity || !minInclusive;
          const isMaxBounded = max !== Infinity || !maxInclusive;
          if (isMinBounded && isMaxBounded) {
            outputSets = outputSets.flatMap((set) => [
              {
                ...set,
                [key]: [true, [-Infinity, 1], n, !minInclusive],
              },
              {
                ...set,
                [key]: [!maxInclusive, x, [Infinity, 1], true],
              },
            ]);
          } else if (!isMinBounded && !isMaxBounded) {
            outputSets = outputSets.map((set) => ({
              ...set,
              [key]: "{false}",
            }));
          } else {
            if (isMinBounded) {
              outputSets = outputSets.map((set) => ({
                ...set,
                [key]: [true, [-Infinity, 1], n, !minInclusive],
              }));
            } else {
              outputSets = outputSets.map((set) => ({
                ...set,
                [key]: [!maxInclusive, x, [Infinity, 1], true],
              }));
            }
          }
        } else {
          const rKey = key as keyof Omit<
            typeof RANGE_FEATURES,
            "aspect-ratio" | "device-aspect-ratio"
          >;
          const rSet = set as any;
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
              [rKey]: "{false}",
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
    }
    return outputSets;
  }
};

export const mediaFeatureToPerms = (
  mediaFeature: MediaFeature,
  unitConversions: CompiledUnitConversions
): Perms | string => {
  let minValue: Unit | null = null;
  let minInclusive = true;
  let maxValue: Unit | null = null;
  let maxInclusive = true;

  if (mediaFeature.context === "range") {
    if (mediaFeature.range.leftToken !== null) {
      const { leftToken, leftOp } = mediaFeature.range;
      const value = convertToUnit(leftToken, unitConversions);
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
      const value = convertToUnit(rightToken, unitConversions);
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
    const value = convertToUnit(mediaFeature.value, unitConversions);
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
    !(mediaFeature.feature in RANGE_FEATURES) &&
    mediaFeature.feature !== "orientation"
  ) {
    return mediaFeature.feature;
  }

  if (mediaFeature.context === "boolean") {
    const feature = mediaFeature.feature as keyof any;
    if (mediaFeature.feature === "orientation") {
      return [{}];
    } else if (feature === "color-gamut") {
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
      feature === "overflow-block" ||
      feature === "overflow-inline" ||
      feature === "pointer" ||
      feature === "scan" ||
      feature === "update"
    ) {
      return invertPerm({
        [feature]: "none",
      });
    } else if (
      feature === "aspect-ratio" ||
      feature === "device-aspect-ratio"
    ) {
      return [
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
      if (feature === "color-gamut") {
        const index = ["srgb", "p3", "rec2020"].indexOf(unit.value);
        if (index === -1) {
          return [
            {
              "color-gamut": "{invalid}",
            },
          ];
        } else {
          return [
            {
              "color-gamut": [false, index <= 0, index <= 1, index <= 2],
            },
          ];
        }
      } else {
        return [
          {
            [feature]:
              unit.value in DISCRETE_FEATURES[feature]
                ? unit.value
                : "{invalid}",
          },
        ];
      }
    }
  } else if (mediaFeature.feature === "orientation") {
    if (
      mediaFeature.context !== "range" &&
      mediaFeature.value.type === "<ident-token>"
    ) {
      const { value } = mediaFeature.value;
      if (value === "landscape") {
        return [
          {
            "aspect-ratio": [true, [1, 1], [Infinity, 1], false],
          },
        ];
      } else if (value === "portrait") {
        return [
          {
            "aspect-ratio": [false, [0, 1], [1, 1], true],
          },
        ];
      }
    }
    return [
      {
        "invalid-features": ["orientation"],
      },
    ];
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
          (safeMinValue === safeMaxValue && !(minInclusive && maxInclusive))
        ) {
          return [
            {
              resolution: "{false}",
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
        if (minValue.type === "ratio") {
          safeMinValue = [minValue.numerator, minValue.denominator];
        } else if (minValue.type === "number" && minValue.value > 0) {
          safeMinValue = [minValue.value, 1];
        } else {
          safeMinValue = false;
        }
      }
      if (maxValue !== null) {
        if (maxValue.type === "ratio") {
          safeMaxValue = [maxValue.numerator, maxValue.denominator];
        } else if (maxValue.type === "number" && maxValue.value > 0) {
          safeMaxValue = [maxValue.value, 1];
        } else {
          safeMaxValue = false;
        }
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
          (safeMinValue === safeMaxValue && !(minInclusive && maxInclusive))
        ) {
          return [
            {
              resolution: "{false}",
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
        !Number.isInteger(safeMinValue ?? 0) ||
        !Number.isInteger(safeMaxValue ?? 0)
      ) {
        return [{ [feature]: "{invalid}" }];
      } else {
        if (safeMinValue === null) {
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
            (safeMinValue === safeMaxValue && !(minInclusive && maxInclusive))
          ) {
            return [
              {
                resolution: "{false}",
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
          (safeMinValue === safeMaxValue && !(minInclusive && maxInclusive))
        ) {
          return [
            {
              [feature]: "{false}",
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

export const mediaConditionToPerms = (
  mediaCondition: MediaCondition,
  unitConversions: CompiledUnitConversions
): Perms => {
  const conditionSetsSets: Perm[][] = [];
  for (const child of mediaCondition.children) {
    if ("context" in child) {
      const result = mediaFeatureToPerms(child, unitConversions);
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
      conditionSetsSets.push(mediaConditionToPerms(child, unitConversions));
    }
  }
  if (mediaCondition.operator === "or" || mediaCondition.operator === null) {
    return conditionSetsSets.flat();
  } else if (mediaCondition.operator === "and") {
    return conditionSetsSets.reduce((a, b) => andPerms(a, b));
  } else {
    // "not"
    return notPerms(conditionSetsSets[0]);
  }
};

export const simplifyPerms = (conditionSets: Perms): EvaluateResult => {
  const simplePerms: SimplePerm[] = [];
  const invalidFeatures = new Set<string>();
  const falseFeatures = new Set<string>();

  for (const conditionSet of conditionSets) {
    let isUnmatchable = false;
    if (
      Array.isArray(conditionSet["invalid-features"]) &&
      conditionSet["invalid-features"].length > 0
    ) {
      for (const invalidFeature of conditionSet["invalid-features"]) {
        invalidFeatures.add(invalidFeature);
      }
      isUnmatchable = true;
    }

    const simplePerm: SimplePerm = {};
    for (const k in conditionSet) {
      const set = conditionSet as FullPerm;
      const key = k as keyof FullPerm;
      if (key === "invalid-features") {
        continue;
      } else {
        if (key === "color-gamut") {
          const prev = set[key].toString();
          if (prev === "false,false,false,false") {
            set[key] = "{false}";
          } else if (prev === "true,true,true,true") {
            continue;
          }
        }

        const value = set[key];
        if (value === "{invalid}") {
          invalidFeatures.add(key);
          isUnmatchable = true;
        } else if (value === "{false}") {
          falseFeatures.add(key);
          isUnmatchable = true;
        } else if (value === "{true}") {
          // skip. {true} is required as an intermediary value only
        } else {
          if (key !== "media-type" || value !== "all") {
            if (key in RANGE_FEATURES) {
              const [minInclusive, min, max, maxInclusive] = set[
                key as keyof typeof RANGE_FEATURES
              ] as ConditionRange | ConditionRange<[number, number]>;
              const minValue = typeof min === "number" ? min : min[0] / min[1];
              const maxValue = typeof max === "number" ? max : max[0] / max[1];

              const isMinLTEMax =
                minValue < maxValue ||
                (minValue === maxValue && (!maxInclusive || minInclusive));

              if (isMinLTEMax) {
                const [lbInclusive, lb, ub, ubInclusive] =
                  RANGE_FEATURES[key as keyof typeof RANGE_FEATURES].bounds;
                const lbValue = typeof lb === "number" ? lb : lb[0] / lb[1];
                const ubValue = typeof ub === "number" ? ub : ub[0] / ub[1];

                const isMinLTELowerBound =
                  minValue < lbValue ||
                  (minValue === lbValue && (!lbInclusive || minInclusive));
                const isMinGTUpperBound =
                  minValue > ubValue ||
                  (minValue === ubValue && (!ubInclusive || !minInclusive));

                const isMaxLTLowerBound =
                  maxValue < lbValue ||
                  (maxValue === lbValue && (!lbInclusive || !maxInclusive));
                const isMaxGTEUpperBound =
                  maxValue > ubValue ||
                  (maxValue === ubValue && (!ubInclusive || maxInclusive));

                if (isMinGTUpperBound || isMaxLTLowerBound) {
                  falseFeatures.add(key);
                  isUnmatchable = true;
                } else if (isMinLTELowerBound && isMaxGTEUpperBound) {
                  // {always}
                } else if (isMinLTELowerBound) {
                  simplePerm[key] = [lbInclusive, lb, max, maxInclusive] as any;
                } else if (isMaxGTEUpperBound) {
                  simplePerm[key] = [minInclusive, min, ub, ubInclusive] as any;
                } else {
                  simplePerm[key] = [
                    minInclusive,
                    min,
                    max,
                    maxInclusive,
                  ] as any;
                }
              } else {
                falseFeatures.add(key);
                isUnmatchable = true;
              }
            } else {
              simplePerm[key] = value as any;
            }
          }
        }
      }
    }

    if (!isUnmatchable) {
      simplePerms.push(simplePerm);
    }
  }

  return {
    simplePerms,
    invalidFeatures: [...invalidFeatures].sort(),
    falseFeatures: [...falseFeatures].sort(),
  };
};

export const compileAST = (
  ast: AST,
  units: Partial<UnitConversions> = {}
): EvaluateResult => {
  const unitConversions = compileStaticUnitConversions(units);

  const allConditions: Perms = [];

  for (const mediaQuery of ast) {
    const extraConditions: Perms = [];
    if (mediaQuery.mediaPrefix === "not") {
      if (mediaQuery.mediaType === "print") {
        extraConditions.push({
          "media-type": "not-print",
        });
      } else if (mediaQuery.mediaType === "screen") {
        extraConditions.push({
          "media-type": "not-screen",
        });
      }

      if (mediaQuery.mediaCondition !== null) {
        extraConditions.push(
          ...notPerms(
            mediaConditionToPerms(mediaQuery.mediaCondition, unitConversions)
          ).map((conditionSet) => {
            if (mediaQuery.mediaType === "all") {
              return conditionSet;
            } else {
              return {
                ...conditionSet,
                "media-type": mediaQuery.mediaType,
              };
            }
          })
        );
      }
    } else {
      const mediaType: FullPerm["media-type"] = mediaQuery.mediaType;
      if (mediaQuery.mediaCondition === null) {
        extraConditions.push({
          "media-type": mediaType,
        });
      } else {
        extraConditions.push(
          ...mediaConditionToPerms(
            mediaQuery.mediaCondition,
            unitConversions
          ).map((conditionSet) => ({
            ...conditionSet,
            "media-type": mediaType,
          }))
        );
      }
    }

    if (
      extraConditions.every(
        (condition) => (condition["invalid-features"] ?? []).length === 0
      )
    ) {
      allConditions.push(...extraConditions);
    }
  }

  return simplifyPerms(allConditions);
};

export const compileQuery = (
  query: string,
  units: Partial<UnitConversions> = {}
): EvaluateResult => {
  const ast = toAST(query);
  if (ast === null) {
    throw new Error("Query string was not lexed due to a syntax error");
  }
  return compileAST(ast, units);
};
