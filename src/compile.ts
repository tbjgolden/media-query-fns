import { toAST, AST, MediaCondition, MediaFeature } from "media-query-parser";
import {
  Perm,
  MediaFeatures,
  log,
  permToConditionPairs,
  hasRangeNumberKey,
  hasRangeRatioKey,
  attachPair,
  andRanges,
  RANGE_NUMBER_FEATURES,
  RANGE_RATIO_FEATURES,
  DISCRETE_FEATURES,
  isDiscreteKey,
  isRangeRatioKey,
  ConditionRange,
} from "./helpers";
import {
  CompiledUnitConversions,
  compileStaticUnitConversions,
  getRatio,
  getValue,
  simplifyMediaFeature,
  UnitConversions,
} from "./units";

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

export const andPerms = (a: Perm[], b: Perm[]): Perm[] => {
  const newPerms: Perm[] = [];
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
    const key = k;
    if (key in output) {
      const A = output;
      const B = setB;
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
        A[key] = B[key];
      } else if (setB[key] === "{true}") {
        // nothing, A[key] doesn't change
      } else {
        const A = output;
        const B = setB;
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
          A[key] = A[key] === B[key] ? A[key] : "{false}";
        } else if (key === "color-gamut") {
          A[key] = [
            A[key][0] && B[key][0],
            A[key][1] && B[key][1],
            A[key][2] && B[key][2],
            A[key][3] && B[key][3],
          ];
        } else {
          A[key] = andRanges(A[key], B[key]);
        }
      }
    } else {
      // this is type safe, but ts can't work it out
      output[key] = setB[key];
    }
  }
  return output;
};

export const notPerms = (conditionSets: Perm[]): Perm[] => {
  // !(a || b) = !a && !b
  return conditionSets
    .map((conditionSet) => invertPerm(conditionSet))
    .reduce((a: Perm[], b: Perm[]) => andPerms(a, b));
};

export const invertPerm = (set: Perm): Perm[] => {
  log("invert");
  log(set);
  if (Object.keys(set).length === 0) {
    return [];
  } else {
    let outputSets: Perm[] = [{}];
    for (const k in set) {
      const key = k;
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
        const dKey = key;
        const dSet = set;
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
            values.reduce((sets: Perm[], next) => {
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
          const rSet = set;
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
          const rKey = key;
          const rSet = set;
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
): Perm[] => {
  const feature = simplifyMediaFeature(mediaFeature, unitConversions);
  const INVALID = [{ "invalid-features": [mediaFeature.feature] }];

  if (feature.type === "invalid") {
    return INVALID;
  } else if (feature.type === "boolean") {
    if (feature.name === "color-gamut") {
      return [{ "color-gamut": [false, true, true, true] }];
    } else if (feature.name === "grid") {
      return [{ grid: 1 }];
    } else if (isDiscreteKey(feature.name)) {
      return invertPerm({ [feature.name]: "none" });
    } else if (isRangeRatioKey(feature.name)) {
      return [{ [feature.name]: [false, [0, 1], [Infinity, 1], true] }];
    } else {
      return [{ [feature.name]: [false, 0, Infinity, true] }];
    }
  } else if (isDiscreteKey(feature.name)) {
    if (feature.type === "equals") {
      const unit = feature.value;
      if (feature.name === "grid") {
        if (unit.type === "number" && (unit.value === 0 || unit.value === 1)) {
          return [{ grid: unit.value }];
        }
      } else if (
        unit.type === "ident" &&
        unit.value in DISCRETE_FEATURES[feature.name]
      ) {
        if (feature.name === "color-gamut") {
          const index = ["srgb", "p3", "rec2020"].indexOf(unit.value);
          if (index !== -1) {
            return [
              { "color-gamut": [false, index <= 0, index <= 1, index <= 2] },
            ];
          }
        } else {
          return [{ [feature.name]: unit.value }];
        }
      }
    }
    return INVALID;
  } else if (isRangeRatioKey(feature.name)) {
    let bounds: ConditionRange<readonly [number, number]> | null = null;

    if (feature.type === "equals") {
      const ratio = getRatio(feature.value);
      if (ratio !== null) bounds = [true, ratio, ratio, true];
    } else if (feature.type === "single") {
      const ratio = getRatio(feature.value);
      if (ratio !== null) {
        if (feature.op === "<") bounds = [false, [0, 1], ratio, false];
        else if (feature.op === "<=") bounds = [false, [0, 1], ratio, true];
        else if (feature.op === ">")
          bounds = [false, ratio, [Infinity, 1], false];
        else bounds = [true, ratio, [Infinity, 1], false];
      }
    } else if (feature.type === "double") {
      const minRatio = getRatio(feature.min);
      const maxRatio = getRatio(feature.max);
      if (minRatio !== null && maxRatio !== null) {
        bounds = [
          feature.minOp === "<=",
          minRatio,
          maxRatio,
          feature.maxOp === "<=",
        ];
      }
    }

    return bounds === null ? INVALID : [{ [feature.name]: bounds }];
  } else {
    let bounds: ConditionRange | null = null;

    if (feature.type === "equals") {
      const value = getValue(feature.value, feature.name);
      if (value !== null) bounds = [true, value, value, true];
    } else if (feature.type === "single") {
      const value = getValue(feature.value, feature.name);
      if (value !== null) {
        if (feature.op === "<") bounds = [false, 0, value, false];
        else if (feature.op === "<=") bounds = [false, 0, value, true];
        else if (feature.op === ">") bounds = [false, value, Infinity, false];
        else bounds = [true, value, Infinity, false];
      }
    } else if (feature.type === "double") {
      const minValue = getValue(feature.min, feature.name);
      const maxValue = getValue(feature.max, feature.name);
      if (minValue !== null && maxValue !== null) {
        bounds = [
          feature.minOp === "<=",
          minValue,
          maxValue,
          feature.maxOp === "<=",
        ];
      }
    }

    return bounds === null ? INVALID : [{ [feature.name]: bounds }];
  }
};

export const mediaConditionToPerms = (
  mediaCondition: MediaCondition,
  unitConversions: CompiledUnitConversions
): Perm[] => {
  const conditionSetsSets: Perm[][] = [];
  for (const child of mediaCondition.children) {
    if ("context" in child) {
      conditionSetsSets.push(mediaFeatureToPerms(child, unitConversions));
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

export const simplifyPerms = (perms: Perm[]): EvaluateResult => {
  const simplePerms: SimplePerm[] = [];
  const invalidFeatures = new Set<string>();
  const falseFeatures = new Set<string>();

  for (const perm of perms) {
    let isUnmatchable = false;
    if (Array.isArray(perm["invalid-features"])) {
      if (perm["invalid-features"].length > 0) {
        for (const invalidFeature of perm["invalid-features"]) {
          invalidFeatures.add(invalidFeature);
        }
        isUnmatchable = true;
      }
    }

    const simplePerm: SimplePerm = {};
    for (const p of permToConditionPairs(perm)) {
      if (p[0] === "invalid-features") {
        continue;
      } else {
        if (p[0] === "color-gamut") {
          // because color-gamut value can be always true or always false
          // we should convert this to "{true}" or "{false}"
          // so it can be processed with the rest of the keys below
          const prev = p[1].toString();
          if (prev === "false,false,false,false") {
            p[1] = "{false}";
          } else if (prev === "true,true,true,true") {
            p[1] = "{true}";
          }
        } else if (hasRangeNumberKey(p)) {
          p[1] =
            p[1] === "{invalid}"
              ? "{invalid}"
              : andRanges(p[1], RANGE_NUMBER_FEATURES[p[0]].bounds);
        } else if (hasRangeRatioKey(p)) {
          p[1] =
            p[1] === "{invalid}"
              ? "{invalid}"
              : andRanges(p[1], RANGE_RATIO_FEATURES[p[0]].bounds);
        }

        if (p[1] === "{invalid}") {
          invalidFeatures.add(p[0]);
          isUnmatchable = true;
        } else if (p[1] === "{false}") {
          falseFeatures.add(p[0]);
          isUnmatchable = true;
        } else if (p[1] === "{true}") {
          // skip. {true} is removed from output
        } else if (p[0] === "media-type" && p[1] === "all") {
          // skip. media-type: all is removed from output
        } else {
          attachPair(simplePerm, p);
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
  const allConditions: Perm[] = [];

  for (const mediaQuery of ast) {
    const extraConditions: Perm[] = [];
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
      if (mediaQuery.mediaCondition === null) {
        extraConditions.push({
          "media-type": mediaQuery.mediaType,
        });
      } else {
        extraConditions.push(
          ...mediaConditionToPerms(
            mediaQuery.mediaCondition,
            unitConversions
          ).map((conditionSet) => ({
            ...conditionSet,
            "media-type": mediaQuery.mediaType,
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
