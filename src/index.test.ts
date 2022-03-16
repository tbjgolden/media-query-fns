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
    evaluateQuery(
      "not screen and (not ((min-width: 100px) and (max-width: 200px)))"
    )
  ).toEqual(
    simplifyConditionSets([
      {
        width: [true, 100, 200, true],
      },
      {
        "media-type": "not-screen",
      },
    ])
  );
  expect(
    evaluateQuery("not print and (min-width: 100px) and (max-width: 200px)")
  ).toEqual(
    simplifyConditionSets([
      {
        width: [true, -Infinity, 100, false],
      },
      {
        width: [false, 200, Infinity, true],
      },
      {
        "media-type": "not-print",
      },
    ])
  );
  expect(
    evaluateQuery("not ((min-width: 100px) and (max-width: 200px))")
  ).toEqual({
    invalidFeatures: [],
    neverFeatures: [],
    permutations: [
      { width: [true, -Infinity, 100, false] },
      { width: [false, 200, Infinity, true] },
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
    simplifyConditionSets([{}])
  );
});

test("not operator", () => {
  expect(evaluateQuery("not (min-width: 120px)")).toEqual([
    {
      "media-type": "all",
      width: [true, -Infinity, 120, false],
    },
  ]);
  expect(evaluateQuery("not (max-width: 240px)")).toEqual([
    {
      "media-type": "all",
      width: [false, 240, Infinity, true],
    },
  ]);
  expect(evaluateQuery("not (110px <= width <= 220px)")).toEqual([
    {
      "media-type": "all",
      width: [true, -Infinity, 110, false],
    },
    {
      "media-type": "all",
      width: [false, 220, Infinity, true],
    },
  ]);
  expect(evaluateQuery("screen and (not (min-width: 120px))")).toEqual([
    {
      "media-type": "screen",
      width: [true, -Infinity, 120, false],
    },
  ]);
  expect(evaluateQuery("print and (not (max-width: 240px))")).toEqual([
    {
      "media-type": "print",
      width: [false, 240, Infinity, true],
    },
  ]);
  expect(evaluateQuery("not print and (110px <= width <= 220px)")).toEqual([
    {
      "media-type": "not-print",
      width: [true, 110, 220, true],
    },
  ]);
  expect(
    evaluateQuery("not print and (not (110px <= width <= 220px))")
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
