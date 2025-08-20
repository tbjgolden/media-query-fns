import { compileQuery } from "./compile.js";
import { Environment, matches } from "./matches.js";
// import util from "util";

const DEFAULT_DIMENSIONS = {
  widthPx: 1280,
  heightPx: 800,
  dppx: 2,
  deviceWidthPx: 1280,
  deviceHeightPx: 800,
};

const check = (query: string, diffs: Partial<Environment> = {}): boolean => {
  const compiled = compileQuery(query);
  return matches(compiled, {
    ...DEFAULT_DIMENSIONS,
    ...diffs,
  });
};

test("matches width", () => {
  expect(check("(width: 1280px)")).toBe(true);
  expect(check("(max-width: 1400px)")).toBe(true);
  expect(check("(min-width: 1000px)")).toBe(true);
  expect(check("(min-width: 1400px)")).toBe(false);
  expect(check("(width = 1280px)")).toBe(true);
  expect(check("(1280px = width)")).toBe(true);

  expect(check("(1280px <= width <= 1280px)")).toBe(true);
  expect(check("(280px <= width <= 1280px)")).toBe(true);
  expect(check("(1280px < width <= 1280px)")).toBe(false);
  expect(check("(1280px <= width < 1280px)")).toBe(false);
  expect(check("(1280px < width < 1280px)")).toBe(false);
  expect(check("(1279.9px < width < 1280.1px)")).toBe(true);
  expect(check("(12in < width < 35cm)")).toBe(true);
  expect(check("(10000Q < width < 101vw)")).toBe(true);
  expect(check("(width < -1px)")).toBe(false);

  expect(check("(-1px < width < 10000px)")).toBe(true);
  expect(check("(1280px >= width >= 1280px)")).toBe(true);
  expect(check("(1280px >= width >= 280px)")).toBe(true);
  expect(check("(1280px > width >= 1280px)")).toBe(false);
  expect(check("(1280px >= width > 1280px)")).toBe(false);
  expect(check("(1280px > width > 1280px)")).toBe(false);
  expect(check("(1280.1px > width > 1279.9px)")).toBe(true);
  expect(check("(35cm > width > 12in)")).toBe(true);
  expect(check("(101vw > width > 10000Q)")).toBe(true);
  expect(check("(10000px > width > -1px)")).toBe(true);
  expect(check("(-1px > width)")).toBe(false);
});

test("matches media-type", () => {
  expect(check("all")).toBe(true);
  expect(check("not all")).toBe(false);
  expect(check("not all and (width > 1px)")).toBe(false);
  expect(check("not all and (width < 1px)")).toBe(true);
  expect(check("tty")).toBe(false);
  expect(check("not tty")).toBe(true);
  expect(check("randomtext")).toBe(false);
  expect(check("not randomtext")).toBe(false);
  expect(check("screen")).toBe(true);
  expect(check("print")).toBe(false);
  expect(check("not screen")).toBe(false);
  expect(check("not print")).toBe(true);
  const print = { mediaType: "print" } as const;
  expect(check("screen", print)).toBe(false);
  expect(check("print", print)).toBe(true);
  expect(check("not screen", print)).toBe(true);
  expect(check("not print", print)).toBe(false);
  const notScreenOrPrint = { mediaType: "not-screen-or-print" } as const;
  expect(check("screen", notScreenOrPrint)).toBe(false);
  expect(check("print", notScreenOrPrint)).toBe(false);
  expect(check("not screen", notScreenOrPrint)).toBe(true);
  expect(check("not print", notScreenOrPrint)).toBe(true);
});

test("matches resolution", () => {
  expect(check("(resolution)")).toBe(true);
  expect(check("not (resolution)")).toBe(false);
  expect(check("(max-resolution: 128dpi)")).toBe(false);
  expect(check("(min-resolution: 10dpcm)")).toBe(true);
  expect(check("(resolution: 2x)")).toBe(true);
  expect(check("(resolution: 2dppx)")).toBe(true);
  expect(check("(min-resolution: 3x)")).toBe(false);
  expect(check("(max-resolution: 1x)")).toBe(false);
  expect(check("(min-resolution: 1x)")).toBe(true);
  expect(check("(max-resolution: 3x)")).toBe(true);
  expect(check("(min-resolution: 2x)")).toBe(true);
  expect(check("(max-resolution: 2x)")).toBe(true);
});

test("matches hover", () => {
  expect(check("(hover)")).toBe(true);
  expect(check("not (hover)")).toBe(false);
  expect(check("(hover: none)")).toBe(false);
  expect(check("(hover: hover)")).toBe(true);
  const hover = { hover: "none" } as const;
  expect(check("(hover)", hover)).toBe(false);
  expect(check("not (hover)", hover)).toBe(true);
  expect(check("(hover: none)", hover)).toBe(true);
  expect(check("(hover: hover)", hover)).toBe(false);
});

test("matches pointer", () => {
  expect(check("(pointer)")).toBe(true);
  expect(check("not (pointer)")).toBe(false);
  expect(check("(pointer: none)")).toBe(false);
  expect(check("(pointer: coarse)")).toBe(false);
  expect(check("(pointer: fine)")).toBe(true);
  const pointerNone = { pointer: "none" } as const;
  expect(check("(pointer)", pointerNone)).toBe(false);
  expect(check("not (pointer)", pointerNone)).toBe(true);
  expect(check("(pointer: none)", pointerNone)).toBe(true);
  expect(check("(pointer: coarse)", pointerNone)).toBe(false);
  expect(check("(pointer: fine)", pointerNone)).toBe(false);
  const pointerCoarse = { pointer: "coarse" } as const;
  expect(check("(pointer)", pointerCoarse)).toBe(true);
  expect(check("not (pointer)", pointerCoarse)).toBe(false);
  expect(check("(pointer: none)", pointerCoarse)).toBe(false);
  expect(check("(pointer: coarse)", pointerCoarse)).toBe(true);
  expect(check("(pointer: fine)", pointerCoarse)).toBe(false);
  const pointerFine = { pointer: "fine" } as const;
  expect(check("(pointer)", pointerFine)).toBe(true);
  expect(check("not (pointer)", pointerFine)).toBe(false);
  expect(check("(pointer: none)", pointerFine)).toBe(false);
  expect(check("(pointer: coarse)", pointerFine)).toBe(false);
  expect(check("(pointer: fine)", pointerFine)).toBe(true);
});

test("matches color-gamut", () => {
  const gamutSrgb = { colorGamut: "srgb-but-not-p3" } as const;
  expect(check("(color-gamut)", gamutSrgb)).toBe(true);
  expect(check("not (color-gamut)", gamutSrgb)).toBe(false);
  expect(check("(color-gamut: srgb)", gamutSrgb)).toBe(true);
  expect(check("(color-gamut: p3)", gamutSrgb)).toBe(false);
  expect(check("(color-gamut: rec2020)", gamutSrgb)).toBe(false);
  const gamutP3 = { colorGamut: "p3-but-not-rec2020" } as const;
  expect(check("(color-gamut)", gamutP3)).toBe(true);
  expect(check("not (color-gamut)", gamutP3)).toBe(false);
  expect(check("(color-gamut: srgb)", gamutP3)).toBe(true);
  expect(check("(color-gamut: p3)", gamutP3)).toBe(true);
  expect(check("(color-gamut: rec2020)", gamutP3)).toBe(false);
  const gamutRec2020 = { colorGamut: "rec2020" } as const;
  expect(check("(color-gamut)", gamutRec2020)).toBe(true);
  expect(check("not (color-gamut)", gamutRec2020)).toBe(false);
  expect(check("(color-gamut: srgb)", gamutRec2020)).toBe(true);
  expect(check("(color-gamut: p3)", gamutRec2020)).toBe(true);
  expect(check("(color-gamut: rec2020)", gamutRec2020)).toBe(true);
  const gamutNotSrgb = { colorGamut: "not-srgb" } as const;
  expect(check("(color-gamut)", gamutNotSrgb)).toBe(false);
  expect(check("not (color-gamut)", gamutNotSrgb)).toBe(true);
  expect(check("(color-gamut: srgb)", gamutNotSrgb)).toBe(false);
  expect(check("(color-gamut: p3)", gamutNotSrgb)).toBe(false);
  expect(check("(color-gamut: rec2020)", gamutNotSrgb)).toBe(false);
});

test("matches grid", () => {
  expect(check("(grid: 0)")).toBe(true);
  expect(check("(grid: 1)")).toBe(false);
  expect(check("(grid)")).toBe(false);
  expect(check("not (grid)")).toBe(true);
  const grid = { grid: "grid" } as const;
  expect(check("(grid: 0)", grid)).toBe(false);
  expect(check("(grid: 1)", grid)).toBe(true);
  expect(check("(grid)", grid)).toBe(true);
  expect(check("not (grid)", grid)).toBe(false);
});

test("matches orientation", () => {
  expect(check("(orientation)")).toBe(true);
  expect(check("not (orientation)")).toBe(false);
  expect(check("(orientation: landscape)")).toBe(true);
  expect(check("(orientation: portrait)")).toBe(false);
  const portrait = { heightPx: 2000 } as const;
  expect(check("(orientation)", portrait)).toBe(true);
  expect(check("not (orientation)", portrait)).toBe(false);
  expect(check("(orientation: landscape)", portrait)).toBe(false);
  expect(check("(orientation: portrait)", portrait)).toBe(true);
  const square = { widthPx: 1000, heightPx: 1000 } as const;
  expect(check("(orientation)", square)).toBe(true);
  expect(check("not (orientation)", square)).toBe(false);
  expect(check("(orientation: landscape)", square)).toBe(true);
  expect(check("(orientation: portrait)", square)).toBe(true);
});

test("matches aspect-ratio", () => {
  expect(check("(aspect-ratio: 1/1)")).toBe(false);
  expect(check("(max-aspect-ratio: 2/1)")).toBe(true);
  expect(check("(min-aspect-ratio: 1/2)")).toBe(true);
  expect(check("(min-aspect-ratio: 2/1)")).toBe(false);
  expect(check("(aspect-ratio = 1280/800)")).toBe(true);
  expect(check("(1280/800 = aspect-ratio)")).toBe(true);
  expect(check("(16/10 <= aspect-ratio <= 16/10)")).toBe(true);
  expect(check("(16/10 < aspect-ratio <= 16/10)")).toBe(false);
  expect(check("(16/10 <= aspect-ratio < 16/10)")).toBe(false);
  expect(check("(16/10 < aspect-ratio < 16/10)")).toBe(false);
  expect(check("(aspect-ratio < 1/100000)")).toBe(false);
  expect(check("(aspect-ratio > 1/100000)")).toBe(true);
  expect(check("(aspect-ratio > 1)")).toBe(true);
  expect(check("(aspect-ratio > 0.5)")).toBe(true);
  expect(check("(16/10 >= aspect-ratio >= 16/10)")).toBe(true);
  expect(check("(16/10 >= aspect-ratio > 16/10)")).toBe(false);
  expect(check("(16/10 > aspect-ratio >= 16/10)")).toBe(false);
  expect(check("(16/10 > aspect-ratio > 16/10)")).toBe(false);
  expect(check("(1/100000 > aspect-ratio)")).toBe(false);
  expect(check("(1/100000 < aspect-ratio)")).toBe(true);
  expect(check("(1 < aspect-ratio)")).toBe(true);
  expect(check("(0.5 < aspect-ratio)")).toBe(true);
  const noSize = { widthPx: 0, heightPx: 0, deviceWidthPx: 0, deviceHeightPx: 0 };
  expect(check("(aspect-ratio: 1/1)", noSize)).toBe(false);
  expect(check("(min-aspect-ratio: 1/1)", noSize)).toBe(false);
  expect(check("(max-aspect-ratio: 1/1)", noSize)).toBe(false);
});

test("matches color-index", () => {
  expect(check("(color-index > 128)")).toBe(false);
  expect(check("(color-index: 128)")).toBe(false);
  expect(check("(color-index < 129)")).toBe(true);
  expect(check("(color-index)")).toBe(false);
  const colors128 = { colorIndex: 128 } as const;
  expect(check("(color-index > 128)", colors128)).toBe(false);
  expect(check("(color-index: 128)", colors128)).toBe(true);
  expect(check("(color-index <= 128)", colors128)).toBe(true);
  expect(check("(128 >= color-index)", colors128)).toBe(true);
  expect(check("(color-index)", colors128)).toBe(true);
});

test("matches monochrome", () => {
  expect(check("(monochrome > 2)")).toBe(false);
  expect(check("(monochrome: 2)")).toBe(false);
  expect(check("(monochrome < 2)")).toBe(true);
  expect(check("(monochrome)")).toBe(false);
  const monochrome2 = { monochromeBits: 2 } as const;
  expect(check("(monochrome > 2)", monochrome2)).toBe(false);
  expect(check("(monochrome: 2)", monochrome2)).toBe(true);
  expect(check("(monochrome <= 2)", monochrome2)).toBe(true);
  expect(check("(monochrome)", monochrome2)).toBe(true);
  const monochrome8 = { monochromeBits: 8 } as const;
  expect(check("(monochrome > 2)", monochrome8)).toBe(true);
  expect(check("(2 < monochrome)", monochrome8)).toBe(true);
  expect(check("(monochrome: 2)", monochrome8)).toBe(false);
  expect(check("(monochrome <= 2)", monochrome8)).toBe(false);
  expect(check("(2 >= monochrome)", monochrome8)).toBe(false);
  expect(check("(monochrome)", monochrome8)).toBe(true);
  const blackAndWhite = { monochromeBits: 1 } as const;
  expect(check("(monochrome: 1)", blackAndWhite)).toBe(true);
  expect(check("(monochrome > 1)", blackAndWhite)).toBe(false);
  expect(check("(monochrome)", blackAndWhite)).toBe(true);
});

test("matches others", () => {
  expect(check("(any-hover)")).toBe(true);
  expect(check("(any-hover: none)")).toBe(false);
  expect(check("(any-hover: hover)")).toBe(true);
  expect(check("(any-pointer)")).toBe(true);
  expect(check("(any-pointer: none)")).toBe(false);
  expect(check("(any-pointer: coarse)")).toBe(false);
  expect(check("(any-pointer: fine)")).toBe(true);
  expect(check("(overflow-block)")).toBe(true);
  expect(check("(overflow-block: none)")).toBe(false);
  expect(check("(overflow-block: scroll)")).toBe(true);
  expect(check("(overflow-block: paged)")).toBe(false);
  expect(check("(overflow-inline)")).toBe(true);
  expect(check("(overflow-inline: none)")).toBe(false);
  expect(check("(overflow-inline: scroll)")).toBe(true);
  expect(check("(scan)")).toBe(true);
  expect(check("(scan: interlace)")).toBe(false);
  expect(check("(scan: progressive)")).toBe(true);
  expect(check("(update)")).toBe(true);
  expect(check("(update: none)")).toBe(false);
  expect(check("(update: slow)")).toBe(false);
  expect(check("(update: fast)")).toBe(true);
  expect(check("(update)")).toBe(true);
  expect(check("(update: none)")).toBe(false);
  expect(check("(update: slow)")).toBe(false);
  expect(check("(color)")).toBe(true);
  expect(check("(color: 8)")).toBe(true);
  expect(check("(min-color: 4)")).toBe(true);
  expect(check("(color: 0)")).toBe(false);
  expect(check("not (color)")).toBe(false);
  expect(check("(device-aspect-ratio)")).toBe(true);
  expect(check("(device-aspect-ratio: 16/10)")).toBe(true);
  expect(check("(min-device-aspect-ratio: 1)")).toBe(true);
  expect(check("(device-aspect-ratio: 1/2)")).toBe(false);
  expect(check("not (device-aspect-ratio)")).toBe(false);
  expect(check("(height: 800px)")).toBe(true);
  expect(check("(max-height: 1000px)")).toBe(true);
  expect(check("(min-height: 1000px)")).toBe(false);
  expect(check("(device-width: 1280px)")).toBe(true);
  expect(check("(max-device-width: 1000px)")).toBe(false);
  expect(check("(min-device-width: 1000px)")).toBe(true);
  expect(check("(device-height: 800px)")).toBe(true);
  expect(check("(max-device-height: 1000px)")).toBe(true);
  expect(check("(min-device-height: 1000px)")).toBe(false);
  expect(() => check("not screen and ((not (update: none)) and (monochrome))")).not.toThrow();
});

test("found bugs", () => {
  // "not screen and (min-width: 1000px) and (orientation: landscape)"
  // "not (screen and (min-width: 1000px) and (orientation: landscape))"
  // "(not-screen or (width < 1000px) or (aspect-ratio < 1/1))"
  expect(
    check("not screen and (min-width: 1000px) and (orientation: landscape)", {
      mediaType: "screen",
      widthPx: 900,
      heightPx: 500,
    })
  ).toBe(true);
});
