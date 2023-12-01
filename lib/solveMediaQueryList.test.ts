import { QueryListNode, parseMediaQueryList } from "media-query-parser";
import { solveMediaQueryList } from "./solveMediaQueryList.js";

const r = (str: TemplateStringsArray) => parseMediaQueryList(str[0]) as QueryListNode;

test("simple", () => {
  expect(solveMediaQueryList(r``)).toBe("true");
  expect(solveMediaQueryList(r`all`)).toBe("true");
  expect(solveMediaQueryList(r`screen`)).toBe("unknown");
  expect(solveMediaQueryList(r`print`)).toBe("unknown");
  expect(solveMediaQueryList(r`not all`)).toBe("false");
  expect(solveMediaQueryList(r`not all, all`)).toBe("true");
  expect(solveMediaQueryList(r`screen`, { isMediaTypeScreen: "true" })).toBe("true");
  expect(solveMediaQueryList(r`screen`, { isMediaTypeScreen: "false" })).toBe("false");
  expect(solveMediaQueryList(r`print`, { isMediaTypeScreen: "true" })).toBe("false");
  expect(solveMediaQueryList(r`print`, { isMediaTypeScreen: "false" })).toBe("true");
  // ---
  expect(solveMediaQueryList(r`(width > 1000px)`)).toBe("unknown");
  expect(solveMediaQueryList(r`(width > -1px)`)).toBe("true");
  expect(solveMediaQueryList(r`(min-width: -1px)`)).toBe("true");
  expect(solveMediaQueryList(r`(width < -1px)`)).toBe("false");
  expect(solveMediaQueryList(r`(max-width: -1px)`)).toBe("false");
});
