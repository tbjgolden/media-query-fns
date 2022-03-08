import { queryToConditionSets } from ".";

test("queryToConditionSets", () => {
  expect(queryToConditionSets("@media (min-width: 120px) {")).toEqual([]);
});
