import { compileQuery } from "./compile";
import { matches } from "./matches";

test("matches", () => {
  const query = compileQuery("@media (max-width: 1400px)");
  const DEFAULT_DIMENSIONS = {
    widthPx: 1280,
    heightPx: 800,
    dppx: 2,
    deviceWidthPx: 1280,
    deviceHeightPx: 800,
  };

  expect(matches(query, DEFAULT_DIMENSIONS)).toBe(true);
  expect(
    matches(query, {
      ...DEFAULT_DIMENSIONS,
      widthPx: 1600,
    })
  ).toBe(false);
});
