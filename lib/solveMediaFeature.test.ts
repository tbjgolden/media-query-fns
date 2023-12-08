import { parseMediaFeature } from "media-query-parser";
import { solveMediaFeature } from "./solveMediaFeature.js";

const r = (str: TemplateStringsArray) => parseMediaFeature(str[0]);

test("media feature", () => {
  expect(solveMediaFeature(r``)).toBe("false");
  expect(solveMediaFeature(r`((orientation: portrait) and (monochrome))`)).toBe("false");
  expect(solveMediaFeature(r`(width > 100px)`, { isMediaTypeScreen: "true" })).toBe("unknown");
  expect(solveMediaFeature(r`general(enclosed)`)).toBe("false");
});
