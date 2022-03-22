import { compileQuery } from "./compile";
import { toHumanFriendlyData } from "./human";

test("toHumanFriendlyData", () => {
  expect(toHumanFriendlyData(compileQuery("(min-width: 120px)"))).toEqual([]);
});
