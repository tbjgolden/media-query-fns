import { compileQuery, invertPerm, simplifyPerms } from "./compile.js";

test("evaluateQuery", () => {
  expect(compileQuery("(min-width: 120px)")).toEqual(
    simplifyPerms([
      {
        "media-type": "all",
        width: [true, 120, Number.POSITIVE_INFINITY, true],
      },
    ])
  );
  expect(compileQuery("(min-width: 100px) and (max-width: 200px)")).toEqual(
    simplifyPerms([
      {
        "media-type": "all",
        width: [true, 100, 200, true],
      },
    ])
  );
  expect(compileQuery("(50px < width <= 150px)")).toEqual(
    simplifyPerms([
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
    simplePerms: [
      {
        "aspect-ratio": [true, [1, 2], [Number.POSITIVE_INFINITY, 1], false],
      },
    ],
  });
});

test("handles not queries", () => {
  expect(compileQuery("not (min-width: 120px)")).toEqual(
    simplifyPerms([
      {
        width: [true, 0, 120, false],
      },
    ])
  );
  expect(compileQuery("not ((min-width: 100px) and (max-width: 200px))")).toEqual(
    simplifyPerms([
      {
        width: [true, 0, 100, false],
      },
      {
        width: [false, 200, Number.POSITIVE_INFINITY, true],
      },
    ])
  );
  expect(compileQuery("screen and (not ((min-width: 100px) and (max-width: 200px)))")).toEqual(
    simplifyPerms([
      {
        "media-type": "screen",
        width: [true, 0, 100, false],
      },
      {
        "media-type": "screen",
        width: [false, 200, Number.POSITIVE_INFINITY, true],
      },
    ])
  );
  expect(compileQuery("not print and (min-width: 100px) and (max-width: 200px)")).toEqual(
    simplifyPerms([
      {
        "media-type": "not-print",
      },
      {
        width: [true, 0, 100, false],
      },
      {
        width: [false, 200, Number.POSITIVE_INFINITY, true],
      },
    ])
  );
  expect(compileQuery("not screen and (not ((min-width: 100px) and (max-width: 200px)))")).toEqual(
    simplifyPerms([
      {
        "media-type": "not-screen",
      },
      {
        width: [true, 100, 200, true],
      },
    ])
  );
  expect(compileQuery("not ((min-width: 100px) and (max-width: 200px))")).toEqual({
    invalidFeatures: [],
    falseFeatures: [],
    simplePerms: [
      { width: [true, 0, 100, false] },
      { width: [false, 200, Number.POSITIVE_INFINITY, false] },
    ],
  });
  // expect(() => compileQuery("not (min-width: 100px) and (max-width: 200px)")).toThrow();
});

test("correctly handles weird queries", () => {
  expect(compileQuery("(fake: feature)")).toEqual({
    invalidFeatures: ["fake"],
    falseFeatures: [],
    simplePerms: [],
  });
  expect(compileQuery("not (width: infinite)")).toEqual({
    invalidFeatures: ["width"],
    falseFeatures: [],
    simplePerms: [],
  });
  expect(compileQuery("(aspect-ratio: 0.01/1)")).toEqual(
    simplifyPerms([
      {
        "aspect-ratio": [true, [0.01, 1], [0.01, 1], true],
      },
    ])
  );
  expect(compileQuery("(height < 100px) or (height > 50px)")).toEqual(
    simplifyPerms([
      {
        height: [true, 0, 100, false],
      },
      {
        height: [false, 50, Number.POSITIVE_INFINITY, false],
      },
    ])
  );
});

test("not operator", () => {
  expect(compileQuery("not (width < -1px)")).toEqual(simplifyPerms([{}]));
  expect(compileQuery("not (min-width: 120px)")).toEqual(
    simplifyPerms([
      {
        "media-type": "all",
        width: [true, 0, 120, false],
      },
    ])
  );
  expect(compileQuery("not (max-width: 240px)")).toEqual(
    simplifyPerms([
      {
        "media-type": "all",
        width: [false, 240, Number.POSITIVE_INFINITY, true],
      },
    ])
  );
  expect(compileQuery("not (110px <= width <= 220px)")).toEqual(
    simplifyPerms([
      {
        "media-type": "all",
        width: [true, 0, 110, false],
      },
      {
        "media-type": "all",
        width: [false, 220, Number.POSITIVE_INFINITY, true],
      },
    ])
  );
  expect(compileQuery("screen and (not (min-width: 120px))")).toEqual(
    simplifyPerms([
      {
        "media-type": "screen",
        width: [true, 0, 120, false],
      },
    ])
  );
  expect(compileQuery("print and (not (max-width: 240px))")).toEqual(
    simplifyPerms([
      {
        "media-type": "print",
        width: [false, 240, Number.POSITIVE_INFINITY, true],
      },
    ])
  );
  expect(compileQuery("not print and (110px <= width <= 220px)")).toEqual(
    simplifyPerms([
      {
        "media-type": "not-print",
      },
      {
        width: [true, 0, 110, false],
      },
      {
        width: [false, 220, Number.POSITIVE_INFINITY, false],
      },
    ])
  );
  expect(compileQuery("not print and (not (110px <= width <= 220px))")).toEqual(
    simplifyPerms([
      {
        "media-type": "not-print",
      },
      {
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
    simplifyPerms([
      {
        width: [true, 1280, 1280, true],
      },
    ])
  );
});

test("found bugs", () => {
  expect(
    compileQuery(
      "not screen and (((not ((min-width: 1000px) and (orientation: landscape))) or (color))), (monochrome)"
    )
  ).toEqual(
    simplifyPerms([
      {
        "media-type": "not-screen",
      },
      {
        "aspect-ratio": [true, [1, 1], [Number.POSITIVE_INFINITY, 1], false],
        color: [true, 0, 0, true],
        width: [true, 1000, Number.POSITIVE_INFINITY, false],
      },
      {
        monochrome: [false, 0, Number.POSITIVE_INFINITY, false],
      },
    ])
  );

  expect(compileQuery("(16/10 <= aspect-ratio < 16/10)")).toEqual({
    falseFeatures: ["aspect-ratio"],
    invalidFeatures: [],
    simplePerms: [],
  });

  expect(compileQuery("(hover)")).toEqual({
    falseFeatures: [],
    invalidFeatures: [],
    simplePerms: [
      {
        hover: "hover",
      },
    ],
  });

  expect(
    simplifyPerms(
      invertPerm({
        width: [true, 1000, Number.POSITIVE_INFINITY, true],
        "aspect-ratio": [true, [1, 1], [Number.POSITIVE_INFINITY, 1], false],
      })
    )
  ).toEqual({
    falseFeatures: [],
    invalidFeatures: [],
    simplePerms: [
      {
        width: [true, 0, 1000, false],
      },
      {
        "aspect-ratio": [false, [0, 1], [1, 1], false],
      },
    ],
  });

  expect(compileQuery("(orientation)")).toEqual({
    falseFeatures: [],
    invalidFeatures: [],
    simplePerms: [{}],
  });

  expect(compileQuery("not screen and (min-width: 1000px) and (orientation: landscape)")).toEqual({
    falseFeatures: [],
    invalidFeatures: [],
    simplePerms: [
      { "media-type": "not-screen" },
      {
        width: [true, 0, 1000, false],
      },
      {
        "aspect-ratio": [false, [0, 1], [1, 1], false],
      },
    ],
  });

  expect(compileQuery("(not ((min-width: 1000px) and (orientation: landscape)))")).toEqual({
    simplePerms: [
      {
        width: [true, 0, 1000, false],
      },
      {
        "aspect-ratio": [false, [0, 1], [1, 1], false],
      },
    ],
    invalidFeatures: [],
    falseFeatures: [],
  });

  expect(compileQuery("(prefers-color-scheme: dark)")).toEqual({
    simplePerms: [
      {
        "prefers-color-scheme": "dark",
      },
    ],
    invalidFeatures: [],
    falseFeatures: [],
  });
});
