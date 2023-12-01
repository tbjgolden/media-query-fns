import { FeatureNode, NumericValueNode } from "media-query-parser";
import {
  Kleene3,
  SolverConfig,
  SolverConfigInput,
  createSolverConfig,
} from "./solveMediaQueryList.js";
import {
  compareLength,
  compareRatio,
  compareResolution,
  isValueInteger,
  isValueLength,
  isValueRatio,
  isValueResolution,
} from "./valueHelpers.js";
import { solveMediaCondition_ } from "./solveMediaCondition.js";

export const solveMediaFeature = (
  condition: FeatureNode,
  configInput: SolverConfigInput
): Kleene3 => solveMediaFeature_(condition, createSolverConfig(configInput));

export const solveMediaFeature_ = (feature: FeatureNode, config: SolverConfig): Kleene3 => {
  const isMin = feature.f.startsWith("min-");
  const isMax = feature.f.startsWith("max-");

  if ((isMin || isMax) && feature.t === "value" && feature.v.n !== "ident") {
    const f = feature.f.slice(4);
    return solveMediaFeature_(
      {
        n: "feature",
        t: "range",
        f,
        r: { a: { n: "ident", v: f }, op: isMin ? ">=" : "<=", b: feature.v },
      },
      config
    );
  } else {
    const featureData = config.features.get(feature.f);
    if (featureData) {
      if (feature.t === "boolean") {
        const canBeFalsy =
          (featureData.type === "discrete" &&
            (featureData.values.has("none") || featureData.values.has(0))) ||
          (featureData.type === "range" &&
            (featureData.valueType === "ratio"
              ? featureData.canNumeratorBeZero
              : featureData.canBeZero));

        return canBeFalsy ? config.solveUnknownFeature(feature) : "true";
      } else if (feature.t === "value") {
        // TODO: support min- and max-
        if (featureData.type === "discrete") {
          let value: number | string;
          if (feature.v.n === "ident") {
            value = feature.v.v;
          } else if (feature.v.n === "number" && feature.v.isInt) {
            value = feature.v.v;
          } else {
            return "false";
          }
          return featureData.values.has(value) ? config.solveUnknownFeature(feature) : "false";
        } else {
          // range feature in value context
          if (featureData.valueType === "integer") {
            if (isValueInteger(feature.v)) {
              const isImpossible =
                (feature.v.v < 0 && !featureData.canBeNegative) ||
                (feature.v.v === 0 && !featureData.canBeZero);
              return isImpossible ? "false" : config.solveUnknownFeature(feature);
            } else {
              return "false";
            }
          } else if (featureData.valueType === "length") {
            if (isValueLength(feature.v)) {
              const comparison = compareLength(feature.v, { n: "number", v: 0, isInt: true });
              const isImpossible =
                (comparison === "lt" && !featureData.canBeNegative) ||
                (comparison === "eq" && !featureData.canBeZero);
              return isImpossible ? "false" : config.solveUnknownFeature(feature);
            } else {
              return "false";
            }
          } else if (featureData.valueType === "ratio") {
            if (isValueRatio(feature.v)) {
              const comparison = compareRatio(feature.v, { n: "number", v: 0, isInt: true });
              const isImpossible = comparison === "eq" && !featureData.canNumeratorBeZero;
              return isImpossible ? "false" : config.solveUnknownFeature(feature);
            } else {
              return "false";
            }
          } else {
            if (isValueResolution(feature.v)) {
              const comparison = compareResolution(feature.v, { n: "dimension", v: 0, u: "x" });
              const isImpossible =
                (comparison === "lt" && !featureData.canBeNegative) ||
                (comparison === "eq" && !featureData.canBeZero);
              return isImpossible ? "false" : config.solveUnknownFeature(feature);
            } else {
              return "false";
            }
          }
        }
      } else {
        if (featureData.type === "discrete") {
          return "false";
        } else {
          // so what we gotta do here
          if ("op2" in feature.r) {
            return solveMediaCondition_(
              {
                n: "condition",
                op: "and",
                a: {
                  n: "in-parens",
                  v: {
                    n: "feature",
                    t: "range",
                    f: feature.r.b.v,
                    r: { a: feature.r.a, op: feature.r.op, b: feature.r.b },
                  },
                },
                bs: [
                  {
                    n: "in-parens",
                    v: {
                      n: "feature",
                      t: "range",
                      f: feature.r.b.v,
                      r: { a: feature.r.b, op: feature.r.op2, b: feature.r.c },
                    },
                  },
                ],
              },
              config
            );
          } else if (feature.r.b.n === "ident") {
            let op = feature.r.op;
            if (op === "<") op = ">";
            else if (op === "<=") op = ">=";
            else if (op === ">") op = "<";
            else if (op === ">=") op = "<=";

            return solveMediaFeature_(
              {
                n: "feature",
                t: "range",
                f: feature.r.b.v,
                r: { a: feature.r.b, op, b: feature.r.a as NumericValueNode },
              },
              config
            );
          } else {
            const b = feature.r.b as NumericValueNode;

            if (featureData.valueType === "ratio") {
              if (isValueRatio(b)) {
                const l = b.n === "number" ? b.v : b.l;
                const r = b.n === "number" ? 1 : b.r;

                const isImpossible =
                  (l === 0 &&
                    r !== 0 &&
                    ((feature.r.op === "=" && !featureData.canNumeratorBeZero) ||
                      (feature.r.op === "<=" && !featureData.canNumeratorBeZero) ||
                      feature.r.op === "<")) ||
                  (l === 0 &&
                    r === 0 &&
                    (!featureData.canNumeratorBeZero || !featureData.canDenominatorBeZero) &&
                    (feature.r.op === "<" || feature.r.op === ">"));

                if (isImpossible) return "false";

                const isAlways =
                  (feature.r.op === ">=" &&
                    l === 0 &&
                    r !== 0 &&
                    !featureData.canDenominatorBeZero) ||
                  (feature.r.op === ">" &&
                    l === 0 &&
                    r !== 0 &&
                    !featureData.canNumeratorBeZero &&
                    featureData.canDenominatorBeZero) ||
                  (feature.r.op === "<=" &&
                    l !== 0 &&
                    r === 0 &&
                    !(featureData.canNumeratorBeZero && featureData.canDenominatorBeZero)) ||
                  (feature.r.op === "<" && l !== 0 && r === 0 && !featureData.canDenominatorBeZero);

                if (isAlways) return "true";

                return config.solveUnknownFeature(feature);
              } else {
                return "false";
              }
            } else if (featureData.valueType === "integer") {
              if (isValueInteger(b)) {
                const isImpossible =
                  (feature.r.op === "=" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === "=" && !featureData.canBeZero && b.v === 0) ||
                  (feature.r.op === "<=" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === "<=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 0) ||
                  (feature.r.op === "<" && !featureData.canBeNegative && b.v <= 0) ||
                  (feature.r.op === "<" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 1);

                if (isImpossible) return "false";

                const isAlways =
                  (feature.r.op === ">=" && !featureData.canBeNegative && b.v <= 0) ||
                  (feature.r.op === ">=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 1) ||
                  (feature.r.op === ">" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === ">" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 0);

                if (isAlways) return "true";

                return config.solveUnknownFeature(feature);
              } else {
                return "false";
              }
            } else if (featureData.valueType === "length") {
              if (isValueLength(b)) {
                const isImpossible =
                  (feature.r.op === "=" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === "=" && !featureData.canBeZero && b.v === 0) ||
                  (feature.r.op === "<=" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === "<=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 0) ||
                  (feature.r.op === "<" && !featureData.canBeNegative && b.v <= 0);

                if (isImpossible) return "false";

                const isAlways =
                  (feature.r.op === ">=" && !featureData.canBeNegative && b.v <= 0) ||
                  (feature.r.op === ">" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === ">" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 0);

                if (isAlways) return "true";

                return config.solveUnknownFeature(feature);
              } else {
                return "false";
              }
            } else {
              if (isValueResolution(b)) {
                const isImpossible =
                  (feature.r.op === "=" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === "=" && !featureData.canBeZero && b.v === 0) ||
                  (feature.r.op === "<=" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === "<=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 0) ||
                  (feature.r.op === "<" && !featureData.canBeNegative && b.v <= 0);

                if (isImpossible) return "false";

                const isAlways =
                  (feature.r.op === ">=" && !featureData.canBeNegative && b.v <= 0) ||
                  (feature.r.op === ">" && !featureData.canBeNegative && b.v < 0) ||
                  (feature.r.op === ">" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    b.v === 0);

                if (isAlways) return "true";

                return config.solveUnknownFeature(feature);
              } else {
                return "false";
              }
            }
          }
        }
      }
    } else {
      return "false";
    }
  }
};
