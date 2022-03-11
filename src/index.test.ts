import { queryToConditionSets } from ".";

test("queryToConditionSets", () => {
  expect(queryToConditionSets("(min-width: 120px)")).toEqual([
    {
      "media-type": "all",
      width: [true, 120, Infinity, true],
    },
  ]);
  expect(
    queryToConditionSets("(min-width: 100px) and (max-width: 200px)")
  ).toEqual([
    {
      "media-type": "all",
      width: [true, 100, 200, true],
    },
  ]);
  expect(queryToConditionSets("(50px < width <= 150px)")).toEqual([
    {
      "media-type": "all",
      width: [false, 50, 150, true],
    },
  ]);
});

test("not operator", () => {
  expect(queryToConditionSets("not (min-width: 120px)")).toEqual([
    {
      "media-type": "all",
      width: [true, -Infinity, 120, false],
    },
  ]);
  expect(queryToConditionSets("not (max-width: 240px)")).toEqual([
    {
      "media-type": "all",
      width: [false, 240, Infinity, true],
    },
  ]);
  expect(queryToConditionSets("not (110px <= width <= 220px)")).toEqual([
    {
      "media-type": "all",
      width: [true, -Infinity, 110, false],
    },
    {
      "media-type": "all",
      width: [false, 220, Infinity, true],
    },
  ]);
  expect(queryToConditionSets("screen and (not (min-width: 120px))")).toEqual([
    {
      "media-type": "screen",
      width: [true, -Infinity, 120, false],
    },
  ]);
  expect(queryToConditionSets("print and (not (max-width: 240px))")).toEqual([
    {
      "media-type": "print",
      width: [false, 240, Infinity, true],
    },
  ]);
  expect(
    queryToConditionSets("not print and (110px <= width <= 220px)")
  ).toEqual([
    {
      "media-type": "not-print",
      width: [true, 110, 220, true],
    },
  ]);
  expect(
    queryToConditionSets("not print and (not (110px <= width <= 220px))")
  ).toEqual([
    {
      "media-type": "not-print",
      width: [true, -Infinity, 110, false],
    },
    {
      "media-type": "not-print",
      width: [false, 220, Infinity, true],
    },
  ]);
});
