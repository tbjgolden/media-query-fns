import { compileQuery } from "./compile";
import { Environment, matches } from "./matches";
// import util from "util";

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
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (width: 1280px)")).toBe(true);
  expect(check("@media (max-width: 1400px)")).toBe(true);
  expect(check("@media (min-width: 1000px)")).toBe(true);
  expect(check("@media (min-width: 1400px)")).toBe(false);
  expect(check("@media (width = 1280px)")).toBe(true);
  expect(check("@media (1280px = width)")).toBe(true);
  expect(check("@media (1280px <= width <= 1280px)")).toBe(true);
  expect(check("@media (1280px < width <= 1280px)")).toBe(false);
  expect(check("@media (1280px <= width < 1280px)")).toBe(false);
  expect(check("@media (1280px < width < 1280px)")).toBe(false);
  expect(check("@media (1279.9px < width < 1280.1px)")).toBe(true);
  expect(check("@media (12in < width < 35cm)")).toBe(true);
  expect(check("@media (10000Q < width < 101vw)")).toBe(true);
  expect(check("@media (-1px < width < 10000px)")).toBe(true);
  expect(check("@media (-1px > width)")).toBe(false);
});

test("matches media-type", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media all")).toBe(true);
  expect(check("@media not all")).toBe(false);
  expect(check("@media not all and (width > 1px)")).toBe(false);
  expect(check("@media not all and (width < 1px)")).toBe(true);
  expect(check("@media tty")).toBe(false);
  expect(check("@media not tty")).toBe(true);
  expect(() => check("@media randomtext")).toThrow();
  expect(() => check("@media not randomtext")).toThrow();
  expect(check("@media screen")).toBe(true);
  expect(check("@media print")).toBe(false);
  expect(check("@media not screen")).toBe(false);
  expect(check("@media not print")).toBe(true);
  const print = { mediaType: "print" } as const;
  expect(check("@media screen", print)).toBe(false);
  expect(check("@media print", print)).toBe(true);
  expect(check("@media not screen", print)).toBe(true);
  expect(check("@media not print", print)).toBe(false);
  const notScreenOrPrint = { mediaType: "not-screen-or-print" } as const;
  expect(check("@media screen", notScreenOrPrint)).toBe(false);
  expect(check("@media print", notScreenOrPrint)).toBe(false);
  expect(check("@media not screen", notScreenOrPrint)).toBe(true);
  expect(check("@media not print", notScreenOrPrint)).toBe(true);
});

test("matches resolution", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (resolution)")).toBe(true);
  expect(check("@media not (resolution)")).toBe(false);
  expect(check("@media (max-resolution: 128dpi)")).toBe(false);
  expect(check("@media (min-resolution: 10dpcm)")).toBe(true);
  expect(check("@media (resolution: 2x)")).toBe(true);
  expect(check("@media (resolution: 2dppx)")).toBe(true);
  expect(check("@media (min-resolution: 3x)")).toBe(false);
  expect(check("@media (max-resolution: 1x)")).toBe(false);
  expect(check("@media (min-resolution: 1x)")).toBe(true);
  expect(check("@media (max-resolution: 3x)")).toBe(true);
  expect(check("@media (min-resolution: 2x)")).toBe(true);
  expect(check("@media (max-resolution: 2x)")).toBe(true);
});

test("matches hover", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (hover)")).toBe(true);
  expect(check("@media not (hover)")).toBe(false);
  expect(check("@media (hover: none)")).toBe(false);
  expect(check("@media (hover: hover)")).toBe(true);
  const hover = { hover: "none" } as const;
  expect(check("@media (hover)", hover)).toBe(false);
  expect(check("@media not (hover)", hover)).toBe(true);
  expect(check("@media (hover: none)", hover)).toBe(true);
  expect(check("@media (hover: hover)", hover)).toBe(false);
});

test("matches pointer", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (pointer)")).toBe(true);
  expect(check("@media not (pointer)")).toBe(false);
  expect(check("@media (pointer: none)")).toBe(false);
  expect(check("@media (pointer: coarse)")).toBe(false);
  expect(check("@media (pointer: fine)")).toBe(true);
  const pointerNone = { pointer: "none" } as const;
  expect(check("@media (pointer)", pointerNone)).toBe(false);
  expect(check("@media not (pointer)", pointerNone)).toBe(true);
  expect(check("@media (pointer: none)", pointerNone)).toBe(true);
  expect(check("@media (pointer: coarse)", pointerNone)).toBe(false);
  expect(check("@media (pointer: fine)", pointerNone)).toBe(false);
  const pointerCoarse = { pointer: "coarse" } as const;
  expect(check("@media (pointer)", pointerCoarse)).toBe(true);
  expect(check("@media not (pointer)", pointerCoarse)).toBe(false);
  expect(check("@media (pointer: none)", pointerCoarse)).toBe(false);
  expect(check("@media (pointer: coarse)", pointerCoarse)).toBe(true);
  expect(check("@media (pointer: fine)", pointerCoarse)).toBe(false);
  const pointerFine = { pointer: "fine" } as const;
  expect(check("@media (pointer)", pointerFine)).toBe(true);
  expect(check("@media not (pointer)", pointerFine)).toBe(false);
  expect(check("@media (pointer: none)", pointerFine)).toBe(false);
  expect(check("@media (pointer: coarse)", pointerFine)).toBe(false);
  expect(check("@media (pointer: fine)", pointerFine)).toBe(true);
});

test("matches color-gamut", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  const gamutSrgb = { colorGamut: "srgb-but-not-p3" } as const;
  expect(check("@media (color-gamut)", gamutSrgb)).toBe(true);
  expect(check("@media not (color-gamut)", gamutSrgb)).toBe(false);
  expect(check("@media (color-gamut: srgb)", gamutSrgb)).toBe(true);
  expect(check("@media (color-gamut: p3)", gamutSrgb)).toBe(false);
  expect(check("@media (color-gamut: rec2020)", gamutSrgb)).toBe(false);
  const gamutP3 = { colorGamut: "p3-but-not-rec2020" } as const;
  expect(check("@media (color-gamut)", gamutP3)).toBe(true);
  expect(check("@media not (color-gamut)", gamutP3)).toBe(false);
  expect(check("@media (color-gamut: srgb)", gamutP3)).toBe(true);
  expect(check("@media (color-gamut: p3)", gamutP3)).toBe(true);
  expect(check("@media (color-gamut: rec2020)", gamutP3)).toBe(false);
  const gamutRec2020 = { colorGamut: "rec2020" } as const;
  expect(check("@media (color-gamut)", gamutRec2020)).toBe(true);
  expect(check("@media not (color-gamut)", gamutRec2020)).toBe(false);
  expect(check("@media (color-gamut: srgb)", gamutRec2020)).toBe(true);
  expect(check("@media (color-gamut: p3)", gamutRec2020)).toBe(true);
  expect(check("@media (color-gamut: rec2020)", gamutRec2020)).toBe(true);
  const gamutNotSrgb = { colorGamut: "not-srgb" } as const;
  expect(check("@media (color-gamut)", gamutNotSrgb)).toBe(false);
  expect(check("@media not (color-gamut)", gamutNotSrgb)).toBe(true);
  expect(check("@media (color-gamut: srgb)", gamutNotSrgb)).toBe(false);
  expect(check("@media (color-gamut: p3)", gamutNotSrgb)).toBe(false);
  expect(check("@media (color-gamut: rec2020)", gamutNotSrgb)).toBe(false);
});

test("matches grid", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (grid: 0)")).toBe(true);
  expect(check("@media (grid: 1)")).toBe(false);
  expect(check("@media (grid)")).toBe(false);
  expect(check("@media not (grid)")).toBe(true);
  const grid = { grid: "grid" } as const;
  expect(check("@media (grid: 0)", grid)).toBe(false);
  expect(check("@media (grid: 1)", grid)).toBe(true);
  expect(check("@media (grid)", grid)).toBe(true);
  expect(check("@media not (grid)", grid)).toBe(false);
});

test("matches orientation", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (orientation)")).toBe(true);
  expect(check("@media not (orientation)")).toBe(false);
  expect(check("@media (orientation: landscape)")).toBe(true);
  expect(check("@media (orientation: portrait)")).toBe(false);
  const portrait = { heightPx: 2000 } as const;
  expect(check("@media (orientation)", portrait)).toBe(true);
  expect(check("@media not (orientation)", portrait)).toBe(false);
  expect(check("@media (orientation: landscape)", portrait)).toBe(false);
  expect(check("@media (orientation: portrait)", portrait)).toBe(true);
  const square = { widthPx: 1000, heightPx: 1000 } as const;
  expect(check("@media (orientation)", square)).toBe(true);
  expect(check("@media not (orientation)", square)).toBe(false);
  expect(check("@media (orientation: landscape)", square)).toBe(true);
  expect(check("@media (orientation: portrait)", square)).toBe(true);
});

test("matches aspect-ratio", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (aspect-ratio: 1/1)")).toBe(false);
  expect(check("@media (max-aspect-ratio: 2/1)")).toBe(true);
  expect(check("@media (min-aspect-ratio: 1/2)")).toBe(true);
  expect(check("@media (min-aspect-ratio: 2/1)")).toBe(false);
  expect(check("@media (aspect-ratio = 1280/800)")).toBe(true);
  expect(check("@media (1280/800 = aspect-ratio)")).toBe(true);
  expect(check("@media (16/10 <= aspect-ratio <= 16/10)")).toBe(true);
  expect(check("@media (16/10 < aspect-ratio <= 16/10)")).toBe(false);
  expect(check("@media (16/10 <= aspect-ratio < 16/10)")).toBe(false);
  expect(check("@media (16/10 < aspect-ratio < 16/10)")).toBe(false);
  expect(check("@media (aspect-ratio < 1/100000)")).toBe(false);
  expect(check("@media (aspect-ratio > 1/100000)")).toBe(true);
  expect(check("@media (aspect-ratio > 1)")).toBe(true);
  expect(check("@media (aspect-ratio > 0.5)")).toBe(true);
});

test("matches color-index", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (color-index > 128)")).toBe(false);
  expect(check("@media (color-index: 128)")).toBe(false);
  expect(check("@media (color-index < 129)")).toBe(true);
  expect(check("@media (color-index)")).toBe(false);
  const colors128 = { colorIndex: 128 } as const;
  expect(check("@media (color-index > 128)", colors128)).toBe(false);
  expect(check("@media (color-index: 128)", colors128)).toBe(true);
  expect(check("@media (color-index <= 128)", colors128)).toBe(true);
  expect(check("@media (color-index)", colors128)).toBe(true);
});

test("matches monochrome", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (monochrome > 2)")).toBe(false);
  expect(check("@media (monochrome: 2)")).toBe(false);
  expect(check("@media (monochrome < 2)")).toBe(true);
  expect(check("@media (monochrome)")).toBe(false);
  const monochrome2 = { monochromeBits: 2 } as const;
  expect(check("@media (monochrome > 2)", monochrome2)).toBe(false);
  expect(check("@media (monochrome: 2)", monochrome2)).toBe(true);
  expect(check("@media (monochrome <= 2)", monochrome2)).toBe(true);
  expect(check("@media (monochrome)", monochrome2)).toBe(true);
  const monochrome8 = { monochromeBits: 8 } as const;
  expect(check("@media (monochrome > 2)", monochrome8)).toBe(true);
  expect(check("@media (monochrome: 2)", monochrome8)).toBe(false);
  expect(check("@media (monochrome <= 2)", monochrome8)).toBe(false);
  expect(check("@media (monochrome)", monochrome8)).toBe(true);
  const blackAndWhite = { monochromeBits: 1 } as const;
  expect(check("@media (monochrome: 1)", blackAndWhite)).toBe(true);
  expect(check("@media (monochrome > 1)", blackAndWhite)).toBe(false);
  expect(check("@media (monochrome)", blackAndWhite)).toBe(true);
});

test("matches others", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(check("@media (any-hover)")).toBe(true);
  expect(check("@media (any-hover: none)")).toBe(false);
  expect(check("@media (any-hover: hover)")).toBe(true);
  expect(check("@media (any-pointer)")).toBe(true);
  expect(check("@media (any-pointer: none)")).toBe(false);
  expect(check("@media (any-pointer: coarse)")).toBe(false);
  expect(check("@media (any-pointer: fine)")).toBe(true);
  expect(check("@media (overflow-block)")).toBe(true);
  expect(check("@media (overflow-block: none)")).toBe(false);
  expect(check("@media (overflow-block: scroll)")).toBe(true);
  expect(check("@media (overflow-block: paged)")).toBe(false);
  expect(check("@media (overflow-inline)")).toBe(true);
  expect(check("@media (overflow-inline: none)")).toBe(false);
  expect(check("@media (overflow-inline: scroll)")).toBe(true);
  expect(check("@media (scan)")).toBe(true);
  expect(check("@media (scan: interlace)")).toBe(false);
  expect(check("@media (scan: progressive)")).toBe(true);
  expect(check("@media (update)")).toBe(true);
  expect(check("@media (update: none)")).toBe(false);
  expect(check("@media (update: slow)")).toBe(false);
  expect(check("@media (update: fast)")).toBe(true);
  expect(check("@media (update)")).toBe(true);
  expect(check("@media (update: none)")).toBe(false);
  expect(check("@media (update: slow)")).toBe(false);
  expect(check("@media (color)")).toBe(true);
  expect(check("@media (color: 8)")).toBe(true);
  expect(check("@media (min-color: 4)")).toBe(true);
  expect(check("@media (color: 0)")).toBe(false);
  expect(check("@media not (color)")).toBe(false);
  expect(check("@media (device-aspect-ratio)")).toBe(true);
  expect(check("@media (device-aspect-ratio: 16/10)")).toBe(true);
  expect(check("@media (min-device-aspect-ratio: 1)")).toBe(true);
  expect(check("@media (device-aspect-ratio: 1/2)")).toBe(false);
  expect(check("@media not (device-aspect-ratio)")).toBe(false);
  expect(check("@media (height: 800px)")).toBe(true);
  expect(check("@media (max-height: 1000px)")).toBe(true);
  expect(check("@media (min-height: 1000px)")).toBe(false);
  expect(check("@media (device-width: 1280px)")).toBe(true);
  expect(check("@media (max-device-width: 1000px)")).toBe(false);
  expect(check("@media (min-device-width: 1000px)")).toBe(true);
  expect(check("@media (device-height: 800px)")).toBe(true);
  expect(check("@media (max-device-height: 1000px)")).toBe(true);
  expect(check("@media (min-device-height: 1000px)")).toBe(false);
  expect(() =>
    check("@media not screen and ((not (update: none)) and (monochrome))")
  ).not.toThrow();
});

test("found bugs", () => {
  const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
    const compiled = compileQuery(query);
    // console.log(
    //   util.inspect(compiled, {
    //     depth: 10,
    //     colors: true,
    //   })
    // );
    return matches(compiled, {
      ...DEFAULT_DIMENSIONS,
      ...diffs,
    });
  };

  expect(
    check("not screen and (min-width: 1000px) and (orientation: landscape)", {
      mediaType: "screen",
      widthPx: 900,
      heightPx: 500,
    })
  ).toBe(true);
});
