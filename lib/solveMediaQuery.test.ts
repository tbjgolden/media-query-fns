import { parseMediaQuery } from "media-query-parser";
import { solveMediaQuery } from "./solveMediaQuery.js";

const r = (str: TemplateStringsArray) => parseMediaQuery(str[0]);

test("media query", () => {
  expect(solveMediaQuery(r``)).toBe("false");
  expect(solveMediaQuery(r`all`)).toBe("true");
  expect(solveMediaQuery(r`screen`, { isMediaTypeScreen: "true" })).toBe("true");
  expect(solveMediaQuery(r`not all, not all`)).toBe("false");
  expect(solveMediaQuery(r`not all, all`)).toBe("false");
});
