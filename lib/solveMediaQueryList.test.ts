import { FeatureNode, QueryListNode, parseMediaQueryList } from "media-query-parser";
import { solveMediaQueryList } from "./solveMediaQueryList.js";
import { isValueRatio } from "./valueHelpers.js";

const r = (str: TemplateStringsArray) => parseMediaQueryList(str[0]) as QueryListNode;

const solveUnknownFeature = (f: FeatureNode) => {
  if (f.f === "aspect-ratio" && f.t === "value") {
    const n = isValueRatio(f.v) && (f.v.n === "number" ? f.v.v : f.v.l / f.v.r);
    return n === 2 ? "true" : "false";
  }
  return "unknown";
};

test("simple", () => {
  expect(solveMediaQueryList(r``)).toBe("true");
  expect(solveMediaQueryList(r`all`)).toBe("true");
  expect(solveMediaQueryList(r`screen`)).toBe("unknown");
  expect(solveMediaQueryList(r`print`)).toBe("unknown");
  expect(solveMediaQueryList(r`not all`)).toBe("false");
  expect(solveMediaQueryList(r`screen`, { isMediaTypeScreen: "true" })).toBe("true");
  expect(solveMediaQueryList(r`screen`, { isMediaTypeScreen: "false" })).toBe("false");
  expect(solveMediaQueryList(r`print`, { isMediaTypeScreen: "true" })).toBe("false");
  expect(solveMediaQueryList(r`print`, { isMediaTypeScreen: "false" })).toBe("true");
});

test("mql combos", () => {
  expect(solveMediaQueryList(r`not all, not all`)).toBe("false");
  expect(solveMediaQueryList(r`not all, all`)).toBe("true");
  expect(solveMediaQueryList(r`all, screen`)).toBe("true");
  expect(solveMediaQueryList(r`screen, screen`)).toBe("unknown");
});

test("boolean features", () => {
  expect(solveMediaQueryList(r`(width)`)).toBe("unknown");
  expect(solveMediaQueryList(r`(orientation)`)).toBe("true");
  expect(solveMediaQueryList(r`(aspect-ratio)`)).toBe("unknown");
  expect(
    solveMediaQueryList(r`(aspect-ratio)`, {
      solveUnknownFeature: (f) => (f.f === "aspect-ratio" && f.t === "boolean" ? "true" : "false"),
    })
  ).toBe("true");
});

test("value features", () => {
  expect(solveMediaQueryList(r`(aspect-ratio: 2/1)`)).toBe("unknown");
  expect(solveMediaQueryList(r`(aspect-ratio: 2/1)`, { solveUnknownFeature })).toBe("true");
  expect(solveMediaQueryList(r`(aspect-ratio: 2)`, { solveUnknownFeature })).toBe("true");
  expect(solveMediaQueryList(r`(aspect-ratio: 4/2)`, { solveUnknownFeature })).toBe("true");
  expect(solveMediaQueryList(r`(aspect-ratio: 3)`, { solveUnknownFeature })).toBe("false");
  expect(solveMediaQueryList(r`(aspect-ratio: 6/2)`, { solveUnknownFeature })).toBe("false");
  expect(solveMediaQueryList(r`(aspect-ratio: -2/-1)`, { solveUnknownFeature })).toBe("false");
  expect(solveMediaQueryList(r`(aspect-ratio: 2e5/1e5)`, { solveUnknownFeature })).toBe("true");
});

test("range features", () => {
  expect(solveMediaQueryList(r`(width > 1000px)`)).toBe("unknown");
  expect(solveMediaQueryList(r`(width > -1px)`)).toBe("true");
  expect(solveMediaQueryList(r`(min-width: -1px)`)).toBe("true");
  expect(solveMediaQueryList(r`(width < -1px)`)).toBe("false");
  expect(solveMediaQueryList(r`(max-width: -1px)`)).toBe("false");
});

test("mq conditions (and)", () => {
  // tt
  expect(solveMediaQueryList(r`(width >= 0) and (resolution >= 0x)`)).toBe("true");
  // tu
  expect(solveMediaQueryList(r`(width >= 0) and (resolution = 0x)`)).toBe("unknown");
  // tf
  expect(solveMediaQueryList(r`(width >= 0) and (resolution = -1x)`)).toBe("false");
  // uu
  expect(solveMediaQueryList(r`(width > 0) and (resolution = 0x)`)).toBe("unknown");
  // uf
  expect(solveMediaQueryList(r`(width >= 0) and (resolution = -1x)`)).toBe("false");
  // ff
  expect(solveMediaQueryList(r`(width < 0) and (resolution = -1x)`)).toBe("false");
});

test("mq conditions (or)", () => {
  // tt
  expect(solveMediaQueryList(r`((width >= 0) or (resolution >= 0x))`)).toBe("true");
  // tu
  expect(solveMediaQueryList(r`((width >= 0) or (resolution = 0x))`)).toBe("true");
  // tf
  expect(solveMediaQueryList(r`((width >= 0) or (resolution = -1x))`)).toBe("true");
  // uu
  expect(solveMediaQueryList(r`((width > 0) or (resolution = 0x))`)).toBe("unknown");
  // uf
  expect(solveMediaQueryList(r`((width > 0) or (resolution = -1x))`)).toBe("unknown");
  // ff
  expect(solveMediaQueryList(r`((width < 0) or (resolution = -1x))`)).toBe("false");
});

test("mq conditions (not)", () => {
  // t
  expect(solveMediaQueryList(r`(not (width >= 0))`)).toBe("false");
  // u
  expect(solveMediaQueryList(r`(not (width > 0))`)).toBe("unknown");
  // f
  expect(solveMediaQueryList(r`(not (width < 0))`)).toBe("true");
});
