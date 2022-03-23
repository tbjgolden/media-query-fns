import { EvaluateResult, SimplePerm, RANGE_FEATURES } from "./compile";

type Values<T> = T[keyof T];
type KVPairs<T> = Values<{
  [Property in keyof T]: [Property, T[Property]];
}>;

type FeaturePair = KVPairs<Required<SimplePerm>>;

const SORT_ORDER: Record<keyof SimplePerm, number> = {
  "media-type": 0,
  width: 1,
  height: 2,
  "aspect-ratio": 3,
  "device-width": 4,
  "device-height": 5,
  "device-aspect-ratio": 6,
  hover: 7,
  "any-hover": 8,
  pointer: 9,
  "any-pointer": 10,
  resolution: 11,
  color: 12,
  monochrome: 13,
  "color-gamut": 14,
  update: 15,
  scan: 16,
  "color-index": 17,
  "overflow-block": 18,
  "overflow-inline": 19,
  grid: 20,
};

type QuerySegment = {
  type:
    | "type"
    | "feature"
    | "always" // for empty lists
    | "dimension"
    | "number"
    | "ratio"
    | "bool-op"
    | "comparison"
    | "plain"
    | "paren"
    | "never"; // for unreachable code
  value: string;
};

export type HumanFriendlyData = {
  querySegmentLists: QuerySegment[][];
  invalidFeatures: EvaluateResult["invalidFeatures"];
  falseFeatures: EvaluateResult["falseFeatures"];
};

const gcd = (large: number, small: number): number => {
  return small === 0 ? large : gcd(small, large % small);
};
const simplify = (a: number, b: number): [number, number] => {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return [a, b];
  const divisor = gcd(a > b ? a : b, a > b ? b : a);
  return [a / divisor, b / divisor];
};

const to5dp = (n: number) => parseFloat(n.toFixed(5));

const COLOR_GAMUT_DESCRIPTIONS: Record<number, Array<QuerySegment>> = [
  // [ false, false, false, false ],
  [
    {
      type: "never",
      value: "never",
    },
  ],
  // [ false, false, false, true ],
  [
    {
      type: "plain",
      value: "Rec. 2020",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
  ],
  // [ false, false, true, false ],
  [
    {
      type: "plain",
      value: "P3",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "Rec. 2020",
    },
  ],
  // [ false, false, true, true ],
  [
    {
      type: "plain",
      value: "P3",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
  ],
  // [ false, true, false, false ],
  [
    {
      type: "plain",
      value: "sRGB",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "P3",
    },
  ],
  // [ false, true, false, true ],
  [
    {
      type: "plain",
      value: "sRGB",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "P3",
    },
    {
      type: "bool-op",
      value: "or",
    },
    {
      type: "plain",
      value: "Rec. 2020",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
  ],
  // [ false, true, true, false ],
  [
    {
      type: "plain",
      value: "sRGB",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "Rec. 2020",
    },
  ],
  // [ false, true, true, true ],
  [
    {
      type: "plain",
      value: "sRGB",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
  ],
  // [ true, false, false, false ],
  [
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "sRGB",
    },
  ],
  // [ true, false, false, true ],
  [
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "sRGB",
    },
    {
      type: "bool-op",
      value: "or",
    },
    {
      type: "plain",
      value: "Rec. 2020",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
  ],
  // [ true, false, true, false ],
  [
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "sRGB",
    },
    {
      type: "bool-op",
      value: "or",
    },
    {
      type: "plain",
      value: "P3",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "Rec. 2020",
    },
  ],
  // [ true, false, true, true ],
  [
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "sRGB",
    },
    {
      type: "bool-op",
      value: "or",
    },
    {
      type: "plain",
      value: "P3",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
  ],
  // [ true, true, false, false ],
  [
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "P3",
    },
  ],
  // [ true, true, false, true ],
  [
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "P3",
    },
    {
      type: "bool-op",
      value: "or",
    },
    {
      type: "plain",
      value: "Rec. 2020",
    },
    {
      type: "comparison",
      value: "≤",
    },
    {
      type: "feature",
      value: "color-gamut",
    },
  ],
  // [ true, true, true, false ],
  [
    {
      type: "feature",
      value: "color-gamut",
    },
    {
      type: "comparison",
      value: "<",
    },
    {
      type: "feature",
      value: "Rec. 2020",
    },
  ],
  // [ true, true, true, true ],
  [
    {
      type: "never",
      value: "never",
    },
  ],
];

export const featurePairToEnglishQuerySegments = (
  p: FeaturePair
): QuerySegment[] => {
  if (p[0] === "media-type") {
    let value = "is screen";
    if (p[1] === "print") {
      value = "printing";
    } else if (p[1] === "not-print") {
      value = "not printing";
    } else if (p[1] === "not-screen") {
      value = "not a screen";
    }
    return [
      {
        type: "type",
        value,
      },
    ];
  } else if (
    p[0] === "color" ||
    p[0] === "color-index" ||
    p[0] === "monochrome" ||
    p[0] === "device-height" ||
    p[0] === "device-width" ||
    p[0] === "height" ||
    p[0] === "width" ||
    p[0] === "resolution"
  ) {
    const [minBoundsInclusive, minBounds, maxBounds, maxBoundsInclusive] =
      RANGE_FEATURES[p[0]].bounds;
    const [minInclusive, min, max, maxInclusive] = p[1];

    const lowerBounded =
      min > minBounds ||
      (min === minBounds && minBoundsInclusive > minInclusive);
    const upperBounded =
      max < maxBounds ||
      (max === maxBounds && maxBoundsInclusive > maxInclusive);

    const minDim: QuerySegment = {
      type: "never",
      value: "never",
    };
    if (lowerBounded) {
      minDim.type = "dimension";
      let unit = "px";
      if (RANGE_FEATURES[p[0]].type === "integer") {
        minDim.type = "number";
        unit = "";
      } else if (RANGE_FEATURES[p[0]].type === "resolution") {
        unit = "x";
      }
      minDim.value = `${to5dp(min)}${unit}`;
    }

    const maxDim: QuerySegment = {
      type: "never",
      value: "never",
    };
    if (upperBounded) {
      maxDim.type = "dimension";
      let unit = "px";
      if (RANGE_FEATURES[p[0]].type === "integer") {
        maxDim.type = "number";
        unit = "";
      } else if (RANGE_FEATURES[p[0]].type === "resolution") {
        unit = "x";
      }
      maxDim.value = `${to5dp(max)}${unit}`;
    }

    const segments: QuerySegment[] = [];
    if (min === max && minInclusive && maxInclusive) {
      segments.push(
        {
          type: "feature",
          value: p[0],
        },
        {
          type: "comparison",
          value: "=",
        },
        maxDim
      );
    } else {
      if (lowerBounded) {
        segments.push(minDim, {
          type: "comparison",
          value: minInclusive ? "≤" : "<",
        });
      }
      segments.push({
        type: "feature",
        value: p[0],
      });
      if (upperBounded) {
        segments.push(
          {
            type: "comparison",
            value: maxInclusive ? "≤" : "<",
          },
          maxDim
        );
      }
    }
    return segments;
  } else if (p[0] === "aspect-ratio" || p[0] === "device-aspect-ratio") {
    const [minBoundsInclusive, nb, xb, maxBoundsInclusive] =
      RANGE_FEATURES[p[0]].bounds;
    const minBounds = nb[0] / nb[1];
    const maxBounds = xb[0] / xb[1];
    const [minInclusive, n, x, maxInclusive] = p[1];
    const min = n[0] / n[1];
    const max = x[0] / x[1];
    const lowerBounded =
      min > minBounds ||
      (min === minBounds && minBoundsInclusive > minInclusive);
    const upperBounded =
      max < maxBounds ||
      (max === maxBounds && maxBoundsInclusive > maxInclusive);

    const prefix = p[0] === "aspect-ratio" ? "is" : "device is";

    if (min === 1 && max === 1 && minInclusive && maxInclusive) {
      return [
        {
          type: "plain",
          value: `${prefix} square`,
        },
      ];
    } else if (min === 1 && !upperBounded) {
      return [
        {
          type: "plain",
          value: `${prefix} landscape${minInclusive ? " or square" : ""}`,
        },
      ];
    } else if (max === 1 && !lowerBounded) {
      return [
        {
          type: "plain",
          value: `${prefix} portrait${minInclusive ? " or square" : ""}`,
        },
      ];
    }

    const minDim: QuerySegment = {
      type: "ratio",
      value: `${simplify(to5dp(n[0]), to5dp(n[1])).join(":")}`,
    };
    const maxDim: QuerySegment = {
      type: "ratio",
      value: `${simplify(to5dp(x[0]), to5dp(x[1])).join(":")}`,
    };

    const segments: QuerySegment[] = [];
    if (lowerBounded) {
      segments.push(minDim, {
        type: "comparison",
        value: minInclusive ? "≤" : "<",
      });
    }
    segments.push({
      type: "feature",
      value: p[0],
    });
    if (upperBounded) {
      segments.push(
        {
          type: "comparison",
          value: maxInclusive ? "≤" : "<",
        },
        maxDim
      );
    }
    return segments;
  } else if (p[0] === "any-hover" || p[0] === "hover") {
    if (p[0] === "hover") {
      return [
        {
          type: "plain",
          value: `primary input ${
            p[1] === "hover" ? "supports" : "doesn't support"
          }`,
        },
        {
          type: "feature",
          value: "hover",
        },
      ];
    } else {
      return [
        {
          type: "plain",
          value: `${p[1] === "hover" ? "an" : "no"} input supports hover`,
        },
      ];
    }
  } else if (p[0] === "any-pointer" || p[0] === "pointer") {
    if (p[0] === "pointer") {
      return [
        {
          type: "plain",
          value:
            p[1] === "none"
              ? `no pointing device`
              : `primary pointing device is ${
                  p[1] === "fine" ? "precise" : "imprecise"
                }`,
        },
      ];
    } else {
      return [
        {
          type: "plain",
          value:
            p[1] === "none"
              ? `no pointing device`
              : `a pointing device is ${p[1] ? "precise" : "imprecise"}`,
        },
      ];
    }
  } else if (p[0] === "grid") {
    return [
      {
        type: "plain",
        value:
          p[1] === 0
            ? `doesn't use terminal as display`
            : `uses terminal as display`,
      },
    ];
  } else if (p[0] === "scan") {
    return [
      {
        type: "plain",
        value:
          p[1] === "interlace"
            ? `on an alternating frame screen`
            : `on non-alternating frame screen`,
      },
    ];
  } else if (p[0] === "update") {
    return [
      {
        type: "plain",
        value:
          p[1] === "none"
            ? "layout cannot update after render"
            : `layout should update ${p[1] === "slow" ? "slowly" : "quickly"}`,
      },
    ];
  } else if (p[0] === "color-gamut") {
    // color-gamut
    const index =
      (p[1][3] ? 1 : 0) +
      (p[1][2] ? 2 : 0) +
      (p[1][1] ? 4 : 0) +
      (p[1][0] ? 8 : 0);

    const segments = COLOR_GAMUT_DESCRIPTIONS[index];
    const shouldEnclose = segments.some(
      (child) => child.type === "bool-op" && child.value === "or"
    );

    return shouldEnclose
      ? [
          { type: "paren", value: "(" },
          ...segments,
          { type: "paren", value: ")" },
        ]
      : segments;
  } else if (p[0] === "overflow-block") {
    return [
      {
        type: "plain",
        value:
          p[1] === "none"
            ? "cannot view vertical overflow"
            : `can view vertical overflow ${
                p[1] === "scroll" ? "by scrolling" : "as pages"
              }`,
      },
    ];
  } else {
    return [
      {
        type: "plain",
        value:
          p[1] === "none"
            ? "cannot view horizontal overflow"
            : `can view horizontal overflow ${
                p[1] === "scroll" ? "by scrolling" : "as pages"
              }`,
      },
    ];
  }
};

export const toEnglishData = (result: EvaluateResult): HumanFriendlyData => {
  const featurePairLists: FeaturePair[][] = result.simplePerms.map(
    (simplePerm) => {
      const list: FeaturePair[] = [];
      for (const key in simplePerm) {
        const k = key as keyof typeof simplePerm;
        const index = SORT_ORDER[k];
        list[index] = [k, simplePerm[k]] as FeaturePair;
      }
      return list.filter(Boolean);
    }
  );

  let isAlways = false;
  const querySegmentLists: QuerySegment[][] = [];
  for (const featurePairList of featurePairLists) {
    const querySegmentList: QuerySegment[] = [];
    for (const featurePair of featurePairList) {
      const newSegments = featurePairToEnglishQuerySegments(featurePair);
      if (querySegmentList.length > 0 && newSegments.length > 0) {
        querySegmentList.push({
          type: "bool-op",
          value: "and",
        });
      }
      querySegmentList.push(...newSegments);
    }
    if (querySegmentList.length === 0) {
      isAlways = true;
    }
    querySegmentLists.push(querySegmentList);
  }

  return {
    querySegmentLists: isAlways
      ? [[{ type: "always", value: "always" }]]
      : querySegmentLists,
    invalidFeatures: result.invalidFeatures,
    falseFeatures: result.falseFeatures,
  };
};

const ensureSpace = (str: string): string => {
  if (str.length === 0) {
    return "";
  } else {
    const lastChar = str.slice(-1);
    return lastChar === " " || lastChar === "(" ? str : str + " ";
  }
};

// assume a single line of text
export const toEnglishString = (result: EvaluateResult): string => {
  const data = toEnglishData(result);
  if (data.querySegmentLists.length === 0) {
    return "never";
  }
  let hasAlreadyAddedASegmentList = false;
  let englishString = "if";
  for (const querySegmentList of data.querySegmentLists) {
    let str = "";
    for (const querySegment of querySegmentList) {
      if (querySegment.type === "always") {
        return "always";
      } else if (querySegment.type === "never") {
        throw new Error(
          "Unexpected never found, report issue with media-query-fns"
        );
      } else if (querySegment.type === "bool-op") {
        str = ensureSpace(str) + querySegment.value.toUpperCase();
      } else if (querySegment.type === "paren" && querySegment.value === ")") {
        str += ")";
      } else {
        str = ensureSpace(str) + querySegment.value;
      }
    }
    if (hasAlreadyAddedASegmentList) {
      englishString = ensureSpace(englishString) + "OR";
    }
    if (str.includes(" AND ")) {
      englishString = ensureSpace(englishString) + "(" + str + ")";
    } else {
      englishString = ensureSpace(englishString) + str;
    }
    hasAlreadyAddedASegmentList = true;
  }
  return englishString;
};

// divs and spans with inline styles, plus semantic where appropriate
export const toEnglishHTML = (result: EvaluateResult): string => {
  throw new Error("This function is not yet implemented");
  return ``;
};

// use colors to syntax highlight
export const toEnglishCLIString = (result: EvaluateResult): string => {
  throw new Error("This function is not yet implemented");
  return ``;
};
