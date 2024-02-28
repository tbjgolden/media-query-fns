import { FeatureNode, parseMediaQueryList } from "media-query-parser";
import { solveMediaQueryList } from "./solveMediaQueryList.js";
import { isValueRatio } from "./valueHelpers.js";

const r = (str: TemplateStringsArray) => parseMediaQueryList(str[0]);

const solveUnknownFeature = (f: FeatureNode) => {
  if (f.feature === "aspect-ratio" && f.context === "value") {
    const n =
      isValueRatio(f.value) &&
      (f.value._t === "number" ? f.value.value : f.value.left / f.value.right);
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

test("unknown type", () => {
  expect(solveMediaQueryList(r`audial`)).toBe("false");
});

test("unknown feature", () => {
  expect(solveMediaQueryList(r`(ainsley: harriott)`)).toBe("false");
});

test("boolean features", () => {
  expect(solveMediaQueryList(r`(width)`)).toBe("unknown");
  expect(solveMediaQueryList(r`(orientation)`)).toBe("true");
  expect(solveMediaQueryList(r`(aspect-ratio)`)).toBe("unknown");
  expect(
    solveMediaQueryList(r`(aspect-ratio)`, {
      solveUnknownFeature: (f) =>
        f.feature === "aspect-ratio" && f.context === "boolean" ? "true" : "false",
    }),
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
  expect(solveMediaQueryList(r`(width >= 0) and (resolution >= 0x)`)).toBe("true");
  expect(solveMediaQueryList(r`(width >= 0) and (resolution = 0x)`)).toBe("unknown");
  expect(solveMediaQueryList(r`(width >= 0) and (resolution = -1x)`)).toBe("false");
  expect(solveMediaQueryList(r`(width > 0) and (resolution = 0x)`)).toBe("unknown");
  expect(solveMediaQueryList(r`(width >= 0) and (resolution = -1x)`)).toBe("false");
  expect(solveMediaQueryList(r`(width < 0) and (resolution = -1x)`)).toBe("false");
});

test("mq conditions (or)", () => {
  expect(solveMediaQueryList(r`((width >= 0) or (resolution >= 0x))`)).toBe("true");
  expect(solveMediaQueryList(r`((width >= 0) or (resolution = 0x))`)).toBe("true");
  expect(solveMediaQueryList(r`((width >= 0) or (resolution = -1x))`)).toBe("true");
  expect(solveMediaQueryList(r`((width > 0) or (resolution = 0x))`)).toBe("unknown");
  expect(solveMediaQueryList(r`((width > 0) or (resolution = -1x))`)).toBe("unknown");
  expect(solveMediaQueryList(r`((width < 0) or (resolution = -1x))`)).toBe("false");
});

test("mq conditions (not)", () => {
  expect(solveMediaQueryList(r`(not (width >= 0))`)).toBe("false");
  expect(solveMediaQueryList(r`(not (width > 0))`)).toBe("unknown");
  expect(solveMediaQueryList(r`(not (width < 0))`)).toBe("true");
});
