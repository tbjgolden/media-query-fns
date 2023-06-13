import { compileQuery } from "./compile.js";
import { toEnglishData, toEnglishString } from "./english.js";

test("toEnglishData", () => {
  expect(toEnglishData(compileQuery("(min-width: 120px)"))).toEqual({
    invalidFeatures: [],
    falseFeatures: [],
    querySegmentLists: [
      [
        {
          type: "dimension",
          value: "120px",
        },
        {
          type: "comparison",
          value: "≤",
        },
        {
          type: "feature",
          value: "width",
        },
      ],
    ],
  });
});

test("toEnglishString each feature", () => {
  expect(
    toEnglishString(compileQuery("not screen and (min-width: 1000px) and (orientation: landscape)"))
  ).toEqual("if not a screen OR width < 1000px OR is portrait");
  expect(toEnglishString(compileQuery("(min-width: 120px)"))).toEqual("if 120px ≤ width");
  expect(toEnglishString(compileQuery("(width: 1280px)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(max-width: 1400px)"))).toEqual("if width ≤ 1400px");
  expect(toEnglishString(compileQuery("(min-width: 1000px)"))).toEqual("if 1000px ≤ width");
  expect(toEnglishString(compileQuery("(min-width: 1400px)"))).toEqual("if 1400px ≤ width");
  expect(toEnglishString(compileQuery("(width = 1280px)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(1280px = width)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(1280px <= width <= 1280px)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(1280px < width <= 1280px)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(1280px <= width < 1280px)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(1280px < width < 1280px)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(1279.9px < width < 1280.1px)"))).toEqual(
    "if 1279.9px < width < 1280.1px"
  );
  expect(toEnglishString(compileQuery("(12in < width < 35cm)"))).toEqual(
    "if 1152px < width < 1322.835px"
  );
  expect(toEnglishString(compileQuery("(100000Q < width < 101vw)"))).toEqual(
    "if 944.882px < width < 1939.2px"
  );
  expect(toEnglishString(compileQuery("(-1px < width < 10000px)"))).toEqual("if width < 10000px");
  expect(toEnglishString(compileQuery("(-1px > width)"))).toEqual("never");
  expect(toEnglishString(compileQuery("all"))).toEqual("always");
  expect(toEnglishString(compileQuery("not all"))).toEqual("never");
  expect(toEnglishString(compileQuery("not all and (width > 1px)"))).toEqual("if width ≤ 1px");
  expect(toEnglishString(compileQuery("not all and (width < 1px)"))).toEqual("if 1px ≤ width");
  expect(toEnglishString(compileQuery("tty"))).toEqual("never");
  expect(toEnglishString(compileQuery("not tty"))).toEqual("always");
  expect(toEnglishString(compileQuery("screen"))).toEqual("if is screen");
  expect(toEnglishString(compileQuery("print"))).toEqual("if printing");
  expect(toEnglishString(compileQuery("not screen"))).toEqual("if not a screen");
  expect(toEnglishString(compileQuery("not print"))).toEqual("if not printing");
  expect(toEnglishString(compileQuery("(resolution)"))).toEqual("if 0x < resolution");
  expect(toEnglishString(compileQuery("not (resolution)"))).toEqual("if resolution = 0x");
  expect(toEnglishString(compileQuery("(max-resolution: 128dpi)"))).toEqual(
    "if resolution ≤ 1.333x"
  );
  expect(toEnglishString(compileQuery("(min-resolution: 10dpcm)"))).toEqual(
    "if 0.265x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("(resolution: 2x)"))).toEqual("if resolution = 2x");
  expect(toEnglishString(compileQuery("(resolution: 2dppx)"))).toEqual("if resolution = 2x");
  expect(toEnglishString(compileQuery("(min-resolution: 3x)"))).toEqual("if 3x ≤ resolution");
  expect(toEnglishString(compileQuery("(max-resolution: 1x)"))).toEqual("if resolution ≤ 1x");
  expect(toEnglishString(compileQuery("(min-resolution: 1x)"))).toEqual("if 1x ≤ resolution");
  expect(toEnglishString(compileQuery("(max-resolution: 3x)"))).toEqual("if resolution ≤ 3x");
  expect(toEnglishString(compileQuery("(min-resolution: 2x)"))).toEqual("if 2x ≤ resolution");
  expect(toEnglishString(compileQuery("(max-resolution: 2x)"))).toEqual("if resolution ≤ 2x");
  expect(toEnglishString(compileQuery("(hover)"))).toEqual("if primary input supports hover");
  expect(toEnglishString(compileQuery("not (hover)"))).toEqual(
    "if primary input doesn't support hover"
  );
  expect(toEnglishString(compileQuery("(hover: none)"))).toEqual(
    "if primary input doesn't support hover"
  );
  expect(toEnglishString(compileQuery("(hover: hover)"))).toEqual(
    "if primary input supports hover"
  );
  expect(toEnglishString(compileQuery("(pointer)"))).toEqual(
    "if primary pointing device is imprecise OR primary pointing device is precise"
  );
  expect(toEnglishString(compileQuery("not (pointer)"))).toEqual("if no pointing device");
  expect(toEnglishString(compileQuery("(pointer: none)"))).toEqual("if no pointing device");
  expect(toEnglishString(compileQuery("(pointer: coarse)"))).toEqual(
    "if primary pointing device is imprecise"
  );
  expect(toEnglishString(compileQuery("(pointer: fine)"))).toEqual(
    "if primary pointing device is precise"
  );
  expect(toEnglishString(compileQuery("(color-gamut)"))).toEqual("if sRGB ≤ color-gamut");
  expect(toEnglishString(compileQuery("not (color-gamut)"))).toEqual("if color-gamut < sRGB");
  expect(toEnglishString(compileQuery("(color-gamut: srgb)"))).toEqual("if sRGB ≤ color-gamut");
  expect(toEnglishString(compileQuery("(color-gamut: p3)"))).toEqual("if P3 ≤ color-gamut");
  expect(toEnglishString(compileQuery("(color-gamut: rec2020)"))).toEqual(
    "if Rec. 2020 ≤ color-gamut"
  );
  expect(
    toEnglishString(compileQuery("(color-gamut: srgb) and (not (color-gamut: rec2020))"))
  ).toEqual("if sRGB ≤ color-gamut < Rec. 2020");
  expect(toEnglishString(compileQuery("(grid: 0)"))).toEqual("if doesn't use terminal as display");
  expect(toEnglishString(compileQuery("(grid: 1)"))).toEqual("if uses terminal as display");
  expect(toEnglishString(compileQuery("(grid)"))).toEqual("if uses terminal as display");
  expect(toEnglishString(compileQuery("not (grid)"))).toEqual("if doesn't use terminal as display");
  expect(toEnglishString(compileQuery("(orientation)"))).toEqual("always");
  expect(toEnglishString(compileQuery("not (orientation)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(orientation: landscape)"))).toEqual(
    "if is landscape or square"
  );
  expect(toEnglishString(compileQuery("(orientation: portrait)"))).toEqual(
    "if is portrait or square"
  );
  expect(
    toEnglishString(compileQuery("(orientation: portrait) and (orientation: landscape)"))
  ).toEqual("if is square");
  expect(toEnglishString(compileQuery("(aspect-ratio: 1/1)"))).toEqual("if is square");
  expect(toEnglishString(compileQuery("(max-aspect-ratio: 2/1)"))).toEqual("if aspect-ratio ≤ 2:1");
  expect(toEnglishString(compileQuery("(min-aspect-ratio: 1/2)"))).toEqual("if 1:2 ≤ aspect-ratio");
  expect(toEnglishString(compileQuery("(min-aspect-ratio: 2/1)"))).toEqual("if 2:1 ≤ aspect-ratio");
  expect(toEnglishString(compileQuery("(aspect-ratio = 1280/800)"))).toEqual(
    "if aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(1280/800 = aspect-ratio)"))).toEqual(
    "if aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(16/10 <= aspect-ratio <= 16/10)"))).toEqual(
    "if aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(16/10 < aspect-ratio <= 16/10)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(16/10 <= aspect-ratio < 16/10)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(16/10 < aspect-ratio < 16/10)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(aspect-ratio < 1/100000)"))).toEqual(
    "if aspect-ratio < 1:100000"
  );
  expect(toEnglishString(compileQuery("(aspect-ratio > 1/100000)"))).toEqual(
    "if 1:100000 < aspect-ratio"
  );
  expect(toEnglishString(compileQuery("(aspect-ratio > 1)"))).toEqual("if is landscape");
  expect(toEnglishString(compileQuery("(aspect-ratio > 0.5)"))).toEqual("if 0.5:1 < aspect-ratio");
  expect(toEnglishString(compileQuery("(color-index > 128)"))).toEqual("if 128 < color-index");
  expect(toEnglishString(compileQuery("(color-index: 128)"))).toEqual("if color-index = 128");
  expect(toEnglishString(compileQuery("(color-index < 129)"))).toEqual("if color-index < 129");
  expect(toEnglishString(compileQuery("(color-index)"))).toEqual("if 0 < color-index");
  expect(toEnglishString(compileQuery("(color-index <= 128)"))).toEqual("if color-index ≤ 128");
  expect(toEnglishString(compileQuery("(monochrome > 2)"))).toEqual(
    "if monochrome and 2-bit < pixels"
  );
  expect(toEnglishString(compileQuery("(monochrome: 2)"))).toEqual(
    "if monochrome and pixels = 2-bit"
  );
  expect(toEnglishString(compileQuery("(monochrome <= 2)"))).toEqual(
    "if (monochrome and pixels ≤ 2-bit OR not monochrome)"
  );
  expect(toEnglishString(compileQuery("(monochrome)"))).toEqual("if monochrome");
  expect(toEnglishString(compileQuery("(monochrome: 1)"))).toEqual(
    "if monochrome and pixels = 1-bit"
  );
  expect(toEnglishString(compileQuery("(monochrome > 1)"))).toEqual(
    "if monochrome and 1-bit < pixels"
  );
  expect(toEnglishString(compileQuery("(any-hover)"))).toEqual("if an input supports hover");
  expect(toEnglishString(compileQuery("(any-hover: none)"))).toEqual("if no input supports hover");
  expect(toEnglishString(compileQuery("(any-hover: hover)"))).toEqual("if an input supports hover");
  expect(toEnglishString(compileQuery("(any-pointer)"))).toEqual(
    "if a pointing device is imprecise OR a pointing device is precise"
  );
  expect(toEnglishString(compileQuery("(any-pointer: none)"))).toEqual("if no pointing device");
  expect(toEnglishString(compileQuery("(any-pointer: coarse)"))).toEqual(
    "if a pointing device is imprecise"
  );
  expect(toEnglishString(compileQuery("(any-pointer: fine)"))).toEqual(
    "if a pointing device is precise"
  );
  expect(toEnglishString(compileQuery("(overflow-block)"))).toEqual(
    "if can view vertical overflow by scrolling OR can view vertical overflow as pages"
  );
  expect(toEnglishString(compileQuery("(overflow-block: none)"))).toEqual(
    "if cannot view vertical overflow"
  );
  expect(toEnglishString(compileQuery("(overflow-block: scroll)"))).toEqual(
    "if can view vertical overflow by scrolling"
  );
  expect(toEnglishString(compileQuery("(overflow-block: paged)"))).toEqual(
    "if can view vertical overflow as pages"
  );
  expect(toEnglishString(compileQuery("(overflow-inline)"))).toEqual(
    "if can view horizontal overflow by scrolling"
  );
  expect(toEnglishString(compileQuery("(overflow-inline: none)"))).toEqual(
    "if cannot view horizontal overflow"
  );
  expect(toEnglishString(compileQuery("(overflow-inline: scroll)"))).toEqual(
    "if can view horizontal overflow by scrolling"
  );
  expect(toEnglishString(compileQuery("(scan)"))).toEqual(
    "if on alternating frame screen OR on non-alternating frame screen"
  );
  expect(toEnglishString(compileQuery("(scan: interlace)"))).toEqual(
    "if on alternating frame screen"
  );
  expect(toEnglishString(compileQuery("(scan: progressive)"))).toEqual(
    "if on non-alternating frame screen"
  );
  expect(toEnglishString(compileQuery("(update)"))).toEqual(
    "if layout should update slowly OR layout should update quickly"
  );
  expect(toEnglishString(compileQuery("(update: none)"))).toEqual(
    "if layout cannot update after render"
  );
  expect(toEnglishString(compileQuery("(update: slow)"))).toEqual("if layout should update slowly");
  expect(toEnglishString(compileQuery("(update: fast)"))).toEqual(
    "if layout should update quickly"
  );
  expect(toEnglishString(compileQuery("(color)"))).toEqual("if in color");
  expect(toEnglishString(compileQuery("(color: 8)"))).toEqual("if color = 24-bit");
  expect(toEnglishString(compileQuery("(min-color: 4)"))).toEqual("if 12-bit ≤ color");
  expect(toEnglishString(compileQuery("(color: 0)"))).toEqual("if not in color");
  expect(toEnglishString(compileQuery("not (color)"))).toEqual("if not in color");
  expect(toEnglishString(compileQuery("(device-aspect-ratio)"))).toEqual("always");
  expect(toEnglishString(compileQuery("(device-aspect-ratio: 16/10)"))).toEqual(
    "if device-aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(min-device-aspect-ratio: 1)"))).toEqual(
    "if device is landscape or square"
  );
  expect(toEnglishString(compileQuery("(device-aspect-ratio: 1/2)"))).toEqual(
    "if device-aspect-ratio = 1:2"
  );
  expect(toEnglishString(compileQuery("not (device-aspect-ratio)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(height: 800px)"))).toEqual("if height = 800px");
  expect(toEnglishString(compileQuery("(max-height: 1000px)"))).toEqual("if height ≤ 1000px");
  expect(toEnglishString(compileQuery("(min-height: 1000px)"))).toEqual("if 1000px ≤ height");
  expect(toEnglishString(compileQuery("(device-width: 1280px)"))).toEqual(
    "if device-width = 1280px"
  );
  expect(toEnglishString(compileQuery("(max-device-width: 1000px)"))).toEqual(
    "if device-width ≤ 1000px"
  );
  expect(toEnglishString(compileQuery("(min-device-width: 1000px)"))).toEqual(
    "if 1000px ≤ device-width"
  );
  expect(toEnglishString(compileQuery("(device-height: 800px)"))).toEqual(
    "if device-height = 800px"
  );
  expect(toEnglishString(compileQuery("(max-device-height: 1000px)"))).toEqual(
    "if device-height ≤ 1000px"
  );
  expect(toEnglishString(compileQuery("(min-device-height: 1000px)"))).toEqual(
    "if 1000px ≤ device-height"
  );
});

test("toEnglishString insane query", () => {
  expect(
    toEnglishString(
      compileQuery(
        "not screen and (((not ((min-width: 1000px) and (orientation: landscape))) or (color))), (monochrome)"
      )
    )
  ).toEqual(
    "if not a screen OR (1000px ≤ width AND is landscape or square AND not in color) OR monochrome"
  );
  expect(toEnglishString(compileQuery("(min-width: 120px)"))).toEqual("if 120px ≤ width");
  expect(toEnglishString(compileQuery("(width: 1280px)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(max-width: 1400px)"))).toEqual("if width ≤ 1400px");
  expect(toEnglishString(compileQuery("(min-width: 1000px)"))).toEqual("if 1000px ≤ width");
  expect(toEnglishString(compileQuery("(min-width: 1400px)"))).toEqual("if 1400px ≤ width");
  expect(toEnglishString(compileQuery("(width = 1280px)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(1280px = width)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(1280px <= width <= 1280px)"))).toEqual("if width = 1280px");
  expect(toEnglishString(compileQuery("(1280px < width <= 1280px)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(1280px <= width < 1280px)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(1280px < width < 1280px)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(1279.9px < width < 1280.1px)"))).toEqual(
    "if 1279.9px < width < 1280.1px"
  );
  expect(toEnglishString(compileQuery("(12in < width < 35cm)"))).toEqual(
    "if 1152px < width < 1322.835px"
  );
  expect(toEnglishString(compileQuery("(100000Q < width < 101vw)"))).toEqual(
    "if 944.882px < width < 1939.2px"
  );
  expect(toEnglishString(compileQuery("(-1px < width < 10000px)"))).toEqual("if width < 10000px");
  expect(toEnglishString(compileQuery("(-1px > width)"))).toEqual("never");
  expect(toEnglishString(compileQuery("all"))).toEqual("always");
  expect(toEnglishString(compileQuery("not all"))).toEqual("never");
  expect(toEnglishString(compileQuery("not all and (width > 1px)"))).toEqual("if width ≤ 1px");
  expect(toEnglishString(compileQuery("not all and (width < 1px)"))).toEqual("if 1px ≤ width");
  expect(toEnglishString(compileQuery("tty"))).toEqual("never");
  expect(toEnglishString(compileQuery("not tty"))).toEqual("always");
  expect(toEnglishString(compileQuery("screen"))).toEqual("if is screen");
  expect(toEnglishString(compileQuery("print"))).toEqual("if printing");
  expect(toEnglishString(compileQuery("not screen"))).toEqual("if not a screen");
  expect(toEnglishString(compileQuery("not print"))).toEqual("if not printing");
  expect(toEnglishString(compileQuery("(resolution)"))).toEqual("if 0x < resolution");
  expect(toEnglishString(compileQuery("not (resolution)"))).toEqual("if resolution = 0x");
  expect(toEnglishString(compileQuery("(max-resolution: 128dpi)"))).toEqual(
    "if resolution ≤ 1.333x"
  );
  expect(toEnglishString(compileQuery("(min-resolution: 10dpcm)"))).toEqual(
    "if 0.265x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("(resolution: 2x)"))).toEqual("if resolution = 2x");
  expect(toEnglishString(compileQuery("(resolution: 2dppx)"))).toEqual("if resolution = 2x");
  expect(toEnglishString(compileQuery("(min-resolution: 3x)"))).toEqual("if 3x ≤ resolution");
  expect(toEnglishString(compileQuery("(max-resolution: 1x)"))).toEqual("if resolution ≤ 1x");
  expect(toEnglishString(compileQuery("(min-resolution: 1x)"))).toEqual("if 1x ≤ resolution");
  expect(toEnglishString(compileQuery("(max-resolution: 3x)"))).toEqual("if resolution ≤ 3x");
  expect(toEnglishString(compileQuery("(min-resolution: 2x)"))).toEqual("if 2x ≤ resolution");
  expect(toEnglishString(compileQuery("(max-resolution: 2x)"))).toEqual("if resolution ≤ 2x");
  expect(toEnglishString(compileQuery("(hover)"))).toEqual("if primary input supports hover");
  expect(toEnglishString(compileQuery("not (hover)"))).toEqual(
    "if primary input doesn't support hover"
  );
  expect(toEnglishString(compileQuery("(hover: none)"))).toEqual(
    "if primary input doesn't support hover"
  );
  expect(toEnglishString(compileQuery("(hover: hover)"))).toEqual(
    "if primary input supports hover"
  );
  expect(toEnglishString(compileQuery("(pointer)"))).toEqual(
    "if primary pointing device is imprecise OR primary pointing device is precise"
  );
  expect(toEnglishString(compileQuery("not (pointer)"))).toEqual("if no pointing device");
  expect(toEnglishString(compileQuery("(pointer: none)"))).toEqual("if no pointing device");
  expect(toEnglishString(compileQuery("(pointer: coarse)"))).toEqual(
    "if primary pointing device is imprecise"
  );
  expect(toEnglishString(compileQuery("(pointer: fine)"))).toEqual(
    "if primary pointing device is precise"
  );
  expect(toEnglishString(compileQuery("(color-gamut)"))).toEqual("if sRGB ≤ color-gamut");
  expect(toEnglishString(compileQuery("not (color-gamut)"))).toEqual("if color-gamut < sRGB");
  expect(toEnglishString(compileQuery("(color-gamut: srgb)"))).toEqual("if sRGB ≤ color-gamut");
  expect(toEnglishString(compileQuery("(color-gamut: p3)"))).toEqual("if P3 ≤ color-gamut");
  expect(toEnglishString(compileQuery("(color-gamut: rec2020)"))).toEqual(
    "if Rec. 2020 ≤ color-gamut"
  );
  expect(
    toEnglishString(compileQuery("(color-gamut: srgb) and (not (color-gamut: rec2020))"))
  ).toEqual("if sRGB ≤ color-gamut < Rec. 2020");
  expect(toEnglishString(compileQuery("(grid: 0)"))).toEqual("if doesn't use terminal as display");
  expect(toEnglishString(compileQuery("(grid: 1)"))).toEqual("if uses terminal as display");
  expect(toEnglishString(compileQuery("(grid)"))).toEqual("if uses terminal as display");
  expect(toEnglishString(compileQuery("not (grid)"))).toEqual("if doesn't use terminal as display");
  expect(toEnglishString(compileQuery("(orientation)"))).toEqual("always");
  expect(toEnglishString(compileQuery("not (orientation)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(orientation: landscape)"))).toEqual(
    "if is landscape or square"
  );
  expect(toEnglishString(compileQuery("(orientation: portrait)"))).toEqual(
    "if is portrait or square"
  );
  expect(
    toEnglishString(compileQuery("(orientation: portrait) and (orientation: landscape)"))
  ).toEqual("if is square");
  expect(toEnglishString(compileQuery("(aspect-ratio: 1/1)"))).toEqual("if is square");
  expect(toEnglishString(compileQuery("(max-aspect-ratio: 2/1)"))).toEqual("if aspect-ratio ≤ 2:1");
  expect(toEnglishString(compileQuery("(min-aspect-ratio: 1/2)"))).toEqual("if 1:2 ≤ aspect-ratio");
  expect(toEnglishString(compileQuery("(min-aspect-ratio: 2/1)"))).toEqual("if 2:1 ≤ aspect-ratio");
  expect(toEnglishString(compileQuery("(aspect-ratio = 1280/800)"))).toEqual(
    "if aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(1280/800 = aspect-ratio)"))).toEqual(
    "if aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(16/10 <= aspect-ratio <= 16/10)"))).toEqual(
    "if aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(16/10 < aspect-ratio <= 16/10)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(16/10 <= aspect-ratio < 16/10)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(16/10 < aspect-ratio < 16/10)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(aspect-ratio < 1/100000)"))).toEqual(
    "if aspect-ratio < 1:100000"
  );
  expect(toEnglishString(compileQuery("(aspect-ratio > 1/100000)"))).toEqual(
    "if 1:100000 < aspect-ratio"
  );
  expect(toEnglishString(compileQuery("(aspect-ratio > 1)"))).toEqual("if is landscape");
  expect(toEnglishString(compileQuery("(aspect-ratio > 0.5)"))).toEqual("if 0.5:1 < aspect-ratio");
  expect(toEnglishString(compileQuery("(color-index > 128)"))).toEqual("if 128 < color-index");
  expect(toEnglishString(compileQuery("(color-index: 128)"))).toEqual("if color-index = 128");
  expect(toEnglishString(compileQuery("(color-index < 129)"))).toEqual("if color-index < 129");
  expect(toEnglishString(compileQuery("(color-index)"))).toEqual("if 0 < color-index");
  expect(toEnglishString(compileQuery("(color-index <= 128)"))).toEqual("if color-index ≤ 128");
  expect(toEnglishString(compileQuery("(monochrome > 2)"))).toEqual(
    "if monochrome and 2-bit < pixels"
  );
  expect(toEnglishString(compileQuery("(monochrome: 2)"))).toEqual(
    "if monochrome and pixels = 2-bit"
  );
  expect(toEnglishString(compileQuery("(monochrome <= 2)"))).toEqual(
    "if (monochrome and pixels ≤ 2-bit OR not monochrome)"
  );
  expect(toEnglishString(compileQuery("(monochrome)"))).toEqual("if monochrome");
  expect(toEnglishString(compileQuery("(monochrome: 1)"))).toEqual(
    "if monochrome and pixels = 1-bit"
  );
  expect(toEnglishString(compileQuery("(monochrome > 1)"))).toEqual(
    "if monochrome and 1-bit < pixels"
  );
  expect(toEnglishString(compileQuery("(any-hover)"))).toEqual("if an input supports hover");
  expect(toEnglishString(compileQuery("(any-hover: none)"))).toEqual("if no input supports hover");
  expect(toEnglishString(compileQuery("(any-hover: hover)"))).toEqual("if an input supports hover");
  expect(toEnglishString(compileQuery("(any-pointer)"))).toEqual(
    "if a pointing device is imprecise OR a pointing device is precise"
  );
  expect(toEnglishString(compileQuery("(any-pointer: none)"))).toEqual("if no pointing device");
  expect(toEnglishString(compileQuery("(any-pointer: coarse)"))).toEqual(
    "if a pointing device is imprecise"
  );
  expect(toEnglishString(compileQuery("(any-pointer: fine)"))).toEqual(
    "if a pointing device is precise"
  );
  expect(toEnglishString(compileQuery("(overflow-block)"))).toEqual(
    "if can view vertical overflow by scrolling OR can view vertical overflow as pages"
  );
  expect(toEnglishString(compileQuery("(overflow-block: none)"))).toEqual(
    "if cannot view vertical overflow"
  );
  expect(toEnglishString(compileQuery("(overflow-block: scroll)"))).toEqual(
    "if can view vertical overflow by scrolling"
  );
  expect(toEnglishString(compileQuery("(overflow-block: paged)"))).toEqual(
    "if can view vertical overflow as pages"
  );
  expect(toEnglishString(compileQuery("(overflow-inline)"))).toEqual(
    "if can view horizontal overflow by scrolling"
  );
  expect(toEnglishString(compileQuery("(overflow-inline: none)"))).toEqual(
    "if cannot view horizontal overflow"
  );
  expect(toEnglishString(compileQuery("(overflow-inline: scroll)"))).toEqual(
    "if can view horizontal overflow by scrolling"
  );
  expect(toEnglishString(compileQuery("(scan)"))).toEqual(
    "if on alternating frame screen OR on non-alternating frame screen"
  );
  expect(toEnglishString(compileQuery("(scan: interlace)"))).toEqual(
    "if on alternating frame screen"
  );
  expect(toEnglishString(compileQuery("(scan: progressive)"))).toEqual(
    "if on non-alternating frame screen"
  );
  expect(toEnglishString(compileQuery("(update)"))).toEqual(
    "if layout should update slowly OR layout should update quickly"
  );
  expect(toEnglishString(compileQuery("(update: none)"))).toEqual(
    "if layout cannot update after render"
  );
  expect(toEnglishString(compileQuery("(update: slow)"))).toEqual("if layout should update slowly");
  expect(toEnglishString(compileQuery("(update: fast)"))).toEqual(
    "if layout should update quickly"
  );
  expect(toEnglishString(compileQuery("(color)"))).toEqual("if in color");
  expect(toEnglishString(compileQuery("(color: 8)"))).toEqual("if color = 24-bit");
  expect(toEnglishString(compileQuery("(min-color: 4)"))).toEqual("if 12-bit ≤ color");
  expect(toEnglishString(compileQuery("(color: 0)"))).toEqual("if not in color");
  expect(toEnglishString(compileQuery("not (color)"))).toEqual("if not in color");
  expect(toEnglishString(compileQuery("(device-aspect-ratio)"))).toEqual("always");
  expect(toEnglishString(compileQuery("(device-aspect-ratio: 16/10)"))).toEqual(
    "if device-aspect-ratio = 8:5"
  );
  expect(toEnglishString(compileQuery("(min-device-aspect-ratio: 1)"))).toEqual(
    "if device is landscape or square"
  );
  expect(toEnglishString(compileQuery("(device-aspect-ratio: 1/2)"))).toEqual(
    "if device-aspect-ratio = 1:2"
  );
  expect(toEnglishString(compileQuery("not (device-aspect-ratio)"))).toEqual("never");
  expect(toEnglishString(compileQuery("(height: 800px)"))).toEqual("if height = 800px");
  expect(toEnglishString(compileQuery("(max-height: 1000px)"))).toEqual("if height ≤ 1000px");
  expect(toEnglishString(compileQuery("(min-height: 1000px)"))).toEqual("if 1000px ≤ height");
  expect(toEnglishString(compileQuery("(device-width: 1280px)"))).toEqual(
    "if device-width = 1280px"
  );
  expect(toEnglishString(compileQuery("(max-device-width: 1000px)"))).toEqual(
    "if device-width ≤ 1000px"
  );
  expect(toEnglishString(compileQuery("(min-device-width: 1000px)"))).toEqual(
    "if 1000px ≤ device-width"
  );
  expect(toEnglishString(compileQuery("(device-height: 800px)"))).toEqual(
    "if device-height = 800px"
  );
  expect(toEnglishString(compileQuery("(max-device-height: 1000px)"))).toEqual(
    "if device-height ≤ 1000px"
  );
  expect(toEnglishString(compileQuery("(min-device-height: 1000px)"))).toEqual(
    "if 1000px ≤ device-height"
  );
});
