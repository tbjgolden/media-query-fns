import {
  compileQuery,
  invertConditionSet,
  simplifyConditionSets,
} from "./compile";

test("evaluateQuery", () => {
  expect(compileQuery("(min-width: 120px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, 120, Infinity, true],
      },
    ])
  );
  expect(compileQuery("(min-width: 100px) and (max-width: 200px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, 100, 200, true],
      },
    ])
  );
  expect(compileQuery("(50px < width <= 150px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [false, 50, 150, true],
      },
    ])
  );
});

test("checking hyphenated keys", () => {
  expect(compileQuery("(min-aspect-ratio: 1/2)")).toEqual({
    invalidFeatures: [],
    falseFeatures: [],
    permutations: [
      {
        "aspect-ratio": [true, [1, 2], [Infinity, 1], false],
      },
    ],
  });
});

test("handles not queries", () => {
  expect(compileQuery("not (min-width: 120px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, -Infinity, 120, false],
      },
    ])
  );
  expect(
    compileQuery("not ((min-width: 100px) and (max-width: 200px))")
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
    compileQuery("screen and (not ((min-width: 100px) and (max-width: 200px)))")
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
    compileQuery("not print and (min-width: 100px) and (max-width: 200px)")
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
    compileQuery(
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
    compileQuery("not ((min-width: 100px) and (max-width: 200px))")
  ).toEqual({
    invalidFeatures: [],
    falseFeatures: [],
    permutations: [
      { width: [true, 0, 100, false] },
      { width: [false, 200, Infinity, false] },
    ],
  });
  expect(() =>
    compileQuery("not (min-width: 100px) and (max-width: 200px)")
  ).toThrow();
});

test("correctly handles weird queries", () => {
  expect(compileQuery("not (width: infinite)")).toEqual({
    invalidFeatures: ["width"],
    falseFeatures: [],
    permutations: [],
  });
  expect(compileQuery("(aspect-ratio: 0.01/1)")).toEqual(
    simplifyConditionSets([
      {
        "aspect-ratio": [true, [0.01, 1], [0.01, 1], true],
      },
    ])
  );
  expect(compileQuery("(height < 100px) or (height > 50px)")).toEqual(
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
  expect(compileQuery("not (width < -1px)")).toEqual(
    simplifyConditionSets([{}])
  );
  expect(compileQuery("not (min-width: 120px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [true, -Infinity, 120, false],
      },
    ])
  );
  expect(compileQuery("not (max-width: 240px)")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "all",
        width: [false, 240, Infinity, true],
      },
    ])
  );
  expect(compileQuery("not (110px <= width <= 220px)")).toEqual(
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
  expect(compileQuery("screen and (not (min-width: 120px))")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "screen",
        width: [true, -Infinity, 120, false],
      },
    ])
  );
  expect(compileQuery("print and (not (max-width: 240px))")).toEqual(
    simplifyConditionSets([
      {
        "media-type": "print",
        width: [false, 240, Infinity, true],
      },
    ])
  );
  expect(compileQuery("not print and (110px <= width <= 220px)")).toEqual(
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
  expect(compileQuery("not print and (not (110px <= width <= 220px))")).toEqual(
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

test("custom units", () => {
  expect(
    compileQuery("(width: 1em)", {
      emPx: 1280,
    })
  ).toEqual(
    simplifyConditionSets([
      {
        width: [true, 1280, 1280, true],
      },
    ])
  );
});

test.only("found bugs", () => {
  expect(
    invertConditionSet({
      width: [true, 1000, Infinity, true],
      "aspect-ratio": [true, [1, 1], [Infinity, 1], false],
    }).sort((a, b) => ((a.width?.[1] ?? 0) > (b.width?.[1] ?? 0) ? 1 : -1))
  ).toEqual([
    // {
    //   "aspect-ratio": [true, [1, 1], [Infinity, 1], false],
    //   width: [true, -Infinity, 1000, false],
    // },
    // {
    //   "aspect-ratio": [true, -Infinity, [1, 1], false],
    //   width: [true, 1000, Infinity, true],
    // },
  ]);

  // "not screen and (min-width: 1000px) and (orientation: landscape)"
  // "not (screen and (min-width: 1000px) and (orientation: landscape))"
  // "(not-screen or (screen and width < 1000px) or (screen and aspect-ratio < 1/1))"
  expect(
    compileQuery(
      "not screen and (min-width: 1000px) and (orientation: landscape)"
    )
  ).toEqual({
    permutations: [
      { "media-type": "not-screen" },
      {
        "aspect-ratio": [false, [0, 1], [1, 1], false],
        "media-type": "screen",
      },
      {
        width: [true, 0, 1000, false],
        "media-type": "screen",
      },
    ],
    invalidFeatures: [],
    falseFeatures: [],
  });

  // "(not ((min-width: 1000px) and (orientation: landscape)))"
  // "(width < 1000px) or (aspect-ratio < 1/1)"
  expect(
    compileQuery("(not ((min-width: 1000px) and (orientation: landscape)))")
  ).toEqual({
    permutations: [
      {
        "aspect-ratio": [false, [0, 1], [1, 1], false],
      },
      {
        width: [true, 0, 1000, false],
      },
    ],
    invalidFeatures: [],
    falseFeatures: [],
  });
});
