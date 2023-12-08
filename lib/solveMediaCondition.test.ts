import { parseMediaCondition } from "media-query-parser";
import { solveMediaCondition } from "./solveMediaCondition.js";

const r = (str: TemplateStringsArray) => parseMediaCondition(str[0]);

test("media condition", () => {
  expect(solveMediaCondition(r``)).toBe("false");
  expect(solveMediaCondition(r`((orientation: portrait) and (monochrome))`)).toBe("unknown");
  expect(solveMediaCondition(r`(width > 100px)`, { isMediaTypeScreen: "true" })).toBe("unknown");
});
