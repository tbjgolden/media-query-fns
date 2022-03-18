import { evaluateQuery, simplifyConditionSets } from ".";

test("evaluateQuery", () => {
  expect(evaluateQuery("(min-width: 120px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, 120, Infinity, true],
      },
    ])
  );
  expect(evaluateQuery("(min-width: 100px) and (max-width: 200px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, 100, 200, true],
      },
    ])
  );
  expect(evaluateQuery("(50px < width <= 150px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [false, 50, 150, true],
      },
    ])
  );
});

test("checking hyphenated keys", () => {
  expect(evaluateQuery("(min-aspect-ratio: 1/2)")).toEqual({
    invalidFeatures: [],
    neverFeatures: [],
    permutations: [
      {
        "aspect-ratio": [true, [1, 2], [Infinity, 1], false],
      },
    ],
  });
});

test("handles not queries", () => {
  expect(evaluateQuery("not (min-width: 120px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, -Infinity, 120, false],
      },
    ])
  );
  expect(
    evaluateQuery("not ((min-width: 100px) and (max-width: 200px))")
  ).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, -Infinity, 100, false],
      },
      {
        "media-type": "all",
        width: [false, 200, Infinity, true],
      },
    ])
  );
  expect(
    evaluateQuery(
      "screen and (not ((min-width: 100px) and (max-width: 200px)))"
    )
  ).toEqual(
    simplifyConditionSets([
      {
        "media-type": "screen",
        width: [true, -Infinity, 100, false],
      },
      {
        "media-type": "screen",
        width: [false, 200, Infinity, true],
      },
    ])
  );
  expect(
    evaluateQuery("not print and (min-width: 100px) and (max-width: 200px)")
  ).toEqual(
    simplifyConditionSets([
      {
        "media-type": "not-print",
      },
      {
        "media-type": "print",
        width: [true, -Infinity, 100, false],
      },
      {
        "media-type": "print",
        width: [false, 200, Infinity, true],
      },
    ])
  );
  expect(
    evaluateQuery(
      "not screen and (not ((min-width: 100px) and (max-width: 200px)))"
    )
  ).toEqual(
    simplifyConditionSets([
      {
        "media-type": "not-screen",
      },
      {
        "media-type": "screen",
        width: [true, 100, 200, true],
      },
    ])
  );
  expect(
    evaluateQuery("not ((min-width: 100px) and (max-width: 200px))")
  ).toEqual({
    invalidFeatures: [],
    neverFeatures: [],
    permutations: [
      { width: [true, 0, 100, false] },
      { width: [false, 200, Infinity, false] },
    ],
  });
  expect(() =>
    evaluateQuery("not (min-width: 100px) and (max-width: 200px)")
  ).toThrow();
});

test("correctly handles weird queries", () => {
  expect(evaluateQuery("not (width: infinite)")).toEqual({
    invalidFeatures: ["width"],
    neverFeatures: [],
    permutations: [],
  });
  expect(evaluateQuery("(aspect-ratio: 0.01/1)")).toEqual(
    simplifyConditionSets([
      {
        "aspect-ratio": [true, [0.01, 1], [0.01, 1], true],
      },
    ])
  );
  expect(evaluateQuery("(height < 100px) or (height > 50px)")).toEqual(
    simplifyConditionSets([
      {
        height: [true, 0, 100, false],
      },
      {
        height: [false, 50, Infinity, false],
      },
    ])
  );
});

test("not operator", () => {
  expect(evaluateQuery("not (width < -1px)")).toEqual(
    simplifyConditionSets([{}])
  );
  expect(evaluateQuery("not (min-width: 120px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, -Infinity, 120, false],
      },
    ])
  );
  expect(evaluateQuery("not (max-width: 240px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [false, 240, Infinity, true],
      },
    ])
  );
  expect(evaluateQuery("not (110px <= width <= 220px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, -Infinity, 110, false],
      },
      {
        "media-type": "all",
        width: [false, 220, Infinity, true],
      },
    ])
  );
  expect(evaluateQuery("screen and (not (min-width: 120px))")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "screen",
        width: [true, -Infinity, 120, false],
      },
    ])
  );
  expect(evaluateQuery("print and (not (max-width: 240px))")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "print",
        width: [false, 240, Infinity, true],
      },
    ])
  );
  expect(evaluateQuery("not print and (110px <= width <= 220px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "not-print",
      },
      {
        "media-type": "print",
        width: [true, 0, 110, false],
      },
      {
        "media-type": "print",
        width: [false, 220, Infinity, false],
      },
    ])
  );
  expect(
    evaluateQuery("not print and (not (110px <= width <= 220px))")
  ).toEqual(
    simplifyConditionSets([
      {
        "media-type": "not-print",
      },
      {
        "media-type": "print",
        width: [true, 110, 220, true],
      },
    ])
  );
});
