import { FeatureNode, ParserError, isParserError } from "media-query-parser";
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
  condition: FeatureNode | ParserError,
  configInput?: SolverConfigInput,
): Kleene3 =>
  isParserError(condition)
    ? "false"
    : solveMediaFeature_(condition, createSolverConfig(configInput));

export const solveMediaFeature_ = (feature: FeatureNode, config: SolverConfig): Kleene3 => {
  const isMin = feature.feature.startsWith("min-");
  const isMax = feature.feature.startsWith("max-");

  if ((isMin || isMax) && feature.context === "value" && feature.value._t !== "ident") {
    return solveMediaFeature_(
      {
        _t: "feature",
        context: "range",
        ops: 1,
        feature: feature.feature.slice(4),
        op: isMin ? ">=" : "<=",
        value: feature.value,
        start: feature.start,
        end: feature.end,
      },
      config,
    );
  } else {
    const featureData = config.features.get(feature.feature);
    if (featureData) {
      if (feature.context === "boolean") {
        const canBeFalsy =
          (featureData.type === "discrete" &&
            (featureData.values.has("none") || featureData.values.has(0))) ||
          (featureData.type === "range" &&
            (featureData.valueType === "ratio"
              ? featureData.canNumeratorBeZero
              : featureData.canBeZero));

        return canBeFalsy ? config.solveUnknownFeature(feature) : "true";
      } else if (feature.context === "value") {
        // TODO: support min- and max-
        if (featureData.type === "discrete") {
          let value: number | string;
          if (feature.value._t === "ident") {
            value = feature.value.value;
          } else if (feature.value._t === "number" && feature.value.flag === "integer") {
            value = feature.value.value;
          } else {
            return "false";
          }
          return featureData.values.has(value) ? config.solveUnknownFeature(feature) : "false";
        } else {
          // range feature in value context
          if (featureData.valueType === "integer") {
            if (isValueInteger(feature.value)) {
              const isImpossible =
                (feature.value.value < 0 && !featureData.canBeNegative) ||
                (feature.value.value === 0 && !featureData.canBeZero);
              return isImpossible ? "false" : config.solveUnknownFeature(feature);
            } else {
              return "false";
            }
          } else if (featureData.valueType === "length") {
            if (isValueLength(feature.value)) {
              const comparison = compareLength(feature.value, {
                _t: "number",
                value: 0,
                flag: "integer",
                start: 0,
                end: 0,
              });
              const isImpossible =
                (comparison === "lt" && !featureData.canBeNegative) ||
                (comparison === "eq" && !featureData.canBeZero);
              return isImpossible ? "false" : config.solveUnknownFeature(feature);
            } else {
              return "false";
            }
          } else if (featureData.valueType === "ratio") {
            if (isValueRatio(feature.value)) {
              const comparison = compareRatio(feature.value, {
                _t: "number",
                value: 0,
                flag: "integer",
                start: 0,
                end: 0,
              });
              const isImpossible = comparison === "eq" && !featureData.canNumeratorBeZero;
              return isImpossible ? "false" : config.solveUnknownFeature(feature);
            } else {
              return "false";
            }
          } else {
            if (isValueResolution(feature.value)) {
              const comparison = compareResolution(feature.value, {
                _t: "dimension",
                value: 0,
                unit: "x",
                start: 0,
                end: 0,
              });
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
          if (feature.ops === 2) {
            return solveMediaCondition_(
              {
                _t: "condition",
                op: "and",
                nodes: [
                  {
                    _t: "in-parens",
                    node: {
                      _t: "feature",
                      context: "range",
                      ops: 1,
                      feature: feature.feature,
                      op: feature.minOp === "<" ? ">" : ">=",
                      value: feature.minValue,
                      start: feature.minValue.start,
                      end: feature.minValue.end,
                    },
                  },
                  {
                    _t: "in-parens",
                    node: {
                      _t: "feature",
                      context: "range",
                      ops: 1,
                      feature: feature.feature,
                      op: feature.maxOp,
                      value: feature.maxValue,
                      start: feature.maxValue.start,
                      end: feature.maxValue.end,
                    },
                  },
                ],
                start: feature.start,
                end: feature.end,
              },
              config,
            );
          } else {
            if (featureData.valueType === "ratio") {
              if (isValueRatio(feature.value)) {
                const l = feature.value._t === "number" ? feature.value.value : feature.value.left;
                const r = feature.value._t === "number" ? 1 : feature.value.right;

                const isImpossible =
                  (l === 0 &&
                    r !== 0 &&
                    ((feature.op === "=" && !featureData.canNumeratorBeZero) ||
                      (feature.op === "<=" && !featureData.canNumeratorBeZero) ||
                      feature.op === "<")) ||
                  (l === 0 &&
                    r === 0 &&
                    (!featureData.canNumeratorBeZero || !featureData.canDenominatorBeZero) &&
                    (feature.op === "<" || feature.op === ">"));

                if (isImpossible) return "false";

                const isAlways =
                  (feature.op === ">=" &&
                    l === 0 &&
                    r !== 0 &&
                    !featureData.canDenominatorBeZero) ||
                  (feature.op === ">" &&
                    l === 0 &&
                    r !== 0 &&
                    !featureData.canNumeratorBeZero &&
                    featureData.canDenominatorBeZero) ||
                  (feature.op === "<=" &&
                    l !== 0 &&
                    r === 0 &&
                    !(featureData.canNumeratorBeZero && featureData.canDenominatorBeZero)) ||
                  (feature.op === "<" && l !== 0 && r === 0 && !featureData.canDenominatorBeZero);

                if (isAlways) return "true";

                return config.solveUnknownFeature(feature);
              } else {
                return "false";
              }
            } else if (featureData.valueType === "integer") {
              if (isValueInteger(feature.value)) {
                const isImpossible =
                  (feature.op === "=" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === "=" && !featureData.canBeZero && feature.value.value === 0) ||
                  (feature.op === "<=" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === "<=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 0) ||
                  (feature.op === "<" && !featureData.canBeNegative && feature.value.value <= 0) ||
                  (feature.op === "<" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 1);

                if (isImpossible) return "false";

                const isAlways =
                  (feature.op === ">=" && !featureData.canBeNegative && feature.value.value <= 0) ||
                  (feature.op === ">=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 1) ||
                  (feature.op === ">" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === ">" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 0);

                if (isAlways) return "true";

                return config.solveUnknownFeature(feature);
              } else {
                return "false";
              }
            } else if (featureData.valueType === "length") {
              if (isValueLength(feature.value)) {
                const isImpossible =
                  (feature.op === "=" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === "=" && !featureData.canBeZero && feature.value.value === 0) ||
                  (feature.op === "<=" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === "<=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 0) ||
                  (feature.op === "<" && !featureData.canBeNegative && feature.value.value <= 0);

                if (isImpossible) return "false";

                const isAlways =
                  (feature.op === ">=" && !featureData.canBeNegative && feature.value.value <= 0) ||
                  (feature.op === ">" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === ">" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 0);

                if (isAlways) return "true";

                return config.solveUnknownFeature(feature);
              } else {
                return "false";
              }
            } else {
              if (isValueResolution(feature.value)) {
                const isImpossible =
                  (feature.op === "=" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === "=" && !featureData.canBeZero && feature.value.value === 0) ||
                  (feature.op === "<=" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === "<=" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 0) ||
                  (feature.op === "<" && !featureData.canBeNegative && feature.value.value <= 0);

                if (isImpossible) return "false";

                const isAlways =
                  (feature.op === ">=" && !featureData.canBeNegative && feature.value.value <= 0) ||
                  (feature.op === ">" && !featureData.canBeNegative && feature.value.value < 0) ||
                  (feature.op === ">" &&
                    !featureData.canBeNegative &&
                    !featureData.canBeZero &&
                    feature.value.value === 0);

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
