import { queryToConditionSets } from ".";

test("queryToConditionSets", () => {
  expect(queryToConditionSets("(min-width: 120px)")).toEqual([
    {
      mediaType: "all",
      width: [true, 120, Infinity, true],
    },
  ]);
  expect(
    queryToConditionSets("(min-width: 100px) and (max-width: 200px)")
  ).toEqual([
    {
      mediaType: "all",
      width: [true, 100, 200, true],
    },
  ]);
  expect(queryToConditionSets("(50px < width <= 150px)")).toEqual([
    {
      mediaType: "all",
      width: [false, 50, 150, true],
    },
  ]);
});
