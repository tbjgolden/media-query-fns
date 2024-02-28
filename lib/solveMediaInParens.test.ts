import { isParserError, parseMediaCondition } from "media-query-parser";
import { solveMediaInParens } from "./solveMediaInParens.js";

const r = (str: TemplateStringsArray) => {
  const c = parseMediaCondition(str[0]);
  return isParserError(c) ? c : c.nodes[0];
};

test("media in parens", () => {
  expect(solveMediaInParens(r``)).toBe("false");
  expect(solveMediaInParens(r`((orientation: portrait) and (monochrome))`)).toBe("unknown");
  expect(solveMediaInParens(r`(width > 100px)`, { isMediaTypeScreen: "true" })).toBe("unknown");
});
