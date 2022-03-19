import { compileQuery } from "./compile";
import { Environment, matches } from "./matches";
import util from "util";

const DEFAULT_DIMENSIONS = {
  widthPx: 1280,
  heightPx: 800,
  dppx: 2,
  deviceWidthPx: 1280,
  deviceHeightPx: 800,
};

test("matches width", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    console.log(
      util.inspect(compiled, {
        depth: 10,
        colors: true,
      })
    );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (max-width: 1400px)")).toBe(true);
  expect(check("@media (min-width: 1000px)")).toBe(true);
  expect(check("@media (min-width: 1400px)")).toBe(false);
  expect(check("@media (width: 1280px)")).toBe(true);
  expect(check("@media (width = 1280px)")).toBe(true);
  expect(check("@media (1280px = width)")).toBe(true);
  expect(check("@media (1280px <= width <= 1280px)")).toBe(true);
  expect(check("@media (1280px < width <= 1280px)")).toBe(false);
  expect(check("@media (1280px <= width < 1280px)")).toBe(false);
  expect(check("@media (1280px < width < 1280px)")).toBe(false);
});
