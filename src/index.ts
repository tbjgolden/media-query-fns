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

type ConditionRange = [boolean, number, number, boolean];
type ConditionRanges = ConditionRange[] | "never" | "always";

type FullConditionSet = {
  mediaType: "screen" | "print" | "not-screen" | "not-print" | "all";
  width: ConditionRanges;
};
type ConditionSet = Partial<FullConditionSet>;
type ConditionSets = ConditionSet[];

type StandardLengthUnit = {
  type: "dimension";
  subtype: "length";
  px: number | "infinite";
};
type StandardTimeUnit = {
  type: "dimension";
  subtype: "time";
  ms: number | "infinite";
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
          factor = -1;
        // TODO: make sure this ends up causing the right kind of error
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

export const invertConditionSets = (
  conditions: ConditionSets
): ConditionSets => {
  // TODO: finish this function
  return conditions;
};

export const mediaFeatureToConditionSets = (
  mediaFeature: MediaFeature
): ConditionSets => {
  console.log(JSON.stringify({ mediaFeature }, null, 2));

  if (mediaFeature.context === "boolean") {
    return mediaConditionToConditionSets({
      operator: "and",
      children: [
        {
          operator: "not",
          children: [
            {
              context: "value",
              prefix: null,
              feature: mediaFeature.feature,
              value: {
                type: "<number-token>",
                value: 0,
                flag: "integer",
              },
            },
          ],
        },
        {
          operator: "not",
          children: [
            {
              context: "value",
              prefix: null,
              feature: mediaFeature.feature,
              value: {
                type: "<dimension-token>",
                value: 0,
                unit: "px",
                flag: "number",
              },
            },
          ],
        },
        {
          operator: "not",
          children: [
            {
              context: "value",
              prefix: null,
              feature: mediaFeature.feature,
              value: {
                type: "<ident-token>",
                value: "none",
              },
            },
          ],
        },
      ],
    });
  } else {
    let minValue: StandardUnit | null = null;
    let minInclusive: boolean;
    let maxValue: StandardUnit | null = null;
    let maxInclusive: boolean;

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
    } else {
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

    // TODO: finish this! :)

    return [{}];
  }
};

export const mediaConditionToConditionSets = (
  mediaCondition: MediaCondition
): ConditionSets => {
  const conditionSets: ConditionSet[] = [];
  for (const child of mediaCondition.children) {
    if ("context" in child) {
      conditionSets.push(...mediaFeatureToConditionSets(child));
    } else {
      conditionSets.push(...mediaConditionToConditionSets(child));
    }
  }
  // TODO: use operator to transform
  const mergedConditionSets = conditionSets;
  return mergedConditionSets;
};

export const astToConditionSets = (ast: AST): ConditionSets => {
  console.log(JSON.stringify({ ast }, null, 2));

  const allConditions: ConditionSet[] = [];

  for (const mediaQuery of ast) {
    let mediaType: FullConditionSet["mediaType"] = "all";
    if (mediaQuery.mediaType === "print") {
      mediaType = mediaQuery.mediaPrefix === "not" ? "not-print" : "print";
    } else if (mediaQuery.mediaType === "screen") {
      mediaType = mediaQuery.mediaPrefix === "not" ? "not-screen" : "screen";
    }

    const conditionSet: ConditionSet = {
      mediaType,
    };

    if (mediaQuery.mediaCondition === null) {
      allConditions.push(conditionSet);
    } else {
      mediaConditionToConditionSets(mediaQuery.mediaCondition);
    }

    const mediaCondition = mediaQuery.mediaCondition;

    if (mediaQuery.mediaPrefix === "not") {
      // conditions = invertConditionSets(conditions);
    }

    // allConditions.push(...conditions);
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
