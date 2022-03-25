import { compileQuery } from "./compile";
import { toEnglishData, toEnglishString } from "./english";
import util from "util";
const log = (x: unknown) =>
  console.log(
    util.inspect(x, {
      depth: 10,
      colors: true,
    })
  );

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

test("toEnglishString", () => {
  log(
    compileQuery(
      "not screen and (min-width: 1000px) and (orientation: landscape)"
    )
  );
  expect(
    toEnglishString(
      compileQuery(
        "not screen and (min-width: 1000px) and (orientation: landscape)"
      )
    )
  ).toEqual(
    "if not a screen OR (is screen AND width < 1000px AND is landscape or square) OR (is screen AND 1000px ≤ width AND is portrait)"
  );
  expect(toEnglishString(compileQuery("(min-width: 120px)"))).toEqual(
    "if 120px ≤ width"
  );
  expect(toEnglishString(compileQuery("(width: 1280px)"))).toEqual(
    "if width = 1280px"
  );
  expect(toEnglishString(compileQuery("(max-width: 1400px)"))).toEqual(
    "if width ≤ 1400px"
  );
  expect(toEnglishString(compileQuery("(min-width: 1000px)"))).toEqual(
    "if 1000px ≤ width"
  );
  expect(toEnglishString(compileQuery("(min-width: 1400px)"))).toEqual(
    "if 1400px ≤ width"
  );
  expect(toEnglishString(compileQuery("(width = 1280px)"))).toEqual(
    "if width = 1280px"
  );
  expect(toEnglishString(compileQuery("(1280px = width)"))).toEqual(
    "if width = 1280px"
  );
  expect(toEnglishString(compileQuery("(1280px <= width <= 1280px)"))).toEqual(
    "if width = 1280px"
  );
  expect(toEnglishString(compileQuery("(1280px < width <= 1280px)"))).toEqual(
    "never"
  );
  expect(toEnglishString(compileQuery("(1280px <= width < 1280px)"))).toEqual(
    "never"
  );
  expect(toEnglishString(compileQuery("(1280px < width < 1280px)"))).toEqual(
    "never"
  );
  expect(
    toEnglishString(compileQuery("(1279.9px < width < 1280.1px)"))
  ).toEqual("if 1279.9px < width < 1280.1px");
  expect(toEnglishString(compileQuery("(12in < width < 35cm)"))).toEqual(
    "if 1152px < width < 1322.835px"
  );
  expect(toEnglishString(compileQuery("(100000Q < width < 101vw)"))).toEqual(
    "if 944.882px < width < 1939.2px"
  );
  expect(toEnglishString(compileQuery("(-1px < width < 10000px)"))).toEqual(
    "if width < 10000px"
  );
  expect(toEnglishString(compileQuery("(-1px > width)"))).toEqual("never");
  expect(toEnglishString(compileQuery("all"))).toEqual("always");
  expect(toEnglishString(compileQuery("not all"))).toEqual("never");
  expect(toEnglishString(compileQuery("not all and (width > 1px)"))).toEqual(
    "if width ≤ 1px"
  );
  expect(toEnglishString(compileQuery("not all and (width < 1px)"))).toEqual(
    "if 1px ≤ width"
  );
  expect(toEnglishString(compileQuery("tty"))).toEqual("never");
  expect(toEnglishString(compileQuery("not tty"))).toEqual("always");
  expect(toEnglishString(compileQuery("screen"))).toEqual("if is screen");
  expect(toEnglishString(compileQuery("print"))).toEqual("if printing");
  expect(toEnglishString(compileQuery("not screen"))).toEqual(
    "if not a screen"
  );
  expect(toEnglishString(compileQuery("not print"))).toEqual("if not printing");
  expect(toEnglishString(compileQuery("(resolution)"))).toEqual(
    "if 0x < resolution"
  );
  expect(toEnglishString(compileQuery("not (resolution)"))).toEqual(
    "if resolution = 0x"
  );
  expect(toEnglishString(compileQuery("(max-resolution: 128dpi)"))).toEqual(
    "if resolution ≤ 1.333x"
  );
  expect(toEnglishString(compileQuery("(min-resolution: 10dpcm)"))).toEqual(
    "if 0.265x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("(resolution: 2x)"))).toEqual(
    "if resolution = 2x"
  );
  expect(toEnglishString(compileQuery("(resolution: 2dppx)"))).toEqual(
    "if resolution = 2x"
  );
  expect(toEnglishString(compileQuery("(min-resolution: 3x)"))).toEqual(
    "if 3x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("(max-resolution: 1x)"))).toEqual(
    "if resolution ≤ 1x"
  );
  expect(toEnglishString(compileQuery("(min-resolution: 1x)"))).toEqual(
    "if 1x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("(max-resolution: 3x)"))).toEqual(
    "if resolution ≤ 3x"
  );
  expect(toEnglishString(compileQuery("(min-resolution: 2x)"))).toEqual(
    "if 2x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("(max-resolution: 2x)"))).toEqual(
    "if resolution ≤ 2x"
  );
  expect(toEnglishString(compileQuery("(hover)"))).toEqual(
    "if primary input supports hover"
  );
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
  expect(toEnglishString(compileQuery("not (pointer)"))).toEqual(
    "if no pointing device"
  );
  expect(toEnglishString(compileQuery("(pointer: none)"))).toEqual(
    "if no pointing device"
  );
  expect(toEnglishString(compileQuery("(pointer: coarse)"))).toEqual(
    "if primary pointing device is imprecise"
  );
  expect(toEnglishString(compileQuery("(pointer: fine)"))).toEqual(
    "if primary pointing device is precise"
  );
  expect(toEnglishString(compileQuery("(color-gamut)"))).toEqual(
    "if sRGB ≤ color-gamut"
  );
  expect(toEnglishString(compileQuery("not (color-gamut)"))).toEqual(
    "if color-gamut < sRGB"
  );
  expect(toEnglishString(compileQuery("(color-gamut: srgb)"))).toEqual(
    "if sRGB ≤ color-gamut"
  );
  expect(toEnglishString(compileQuery("(color-gamut: p3)"))).toEqual(
    "if P3 ≤ color-gamut"
  );
  expect(toEnglishString(compileQuery("(color-gamut: rec2020)"))).toEqual(
    "if Rec. 2020 ≤ color-gamut"
  );
  expect(
    toEnglishString(
      compileQuery("(color-gamut: srgb) and (not (color-gamut: rec2020))")
    )
  ).toEqual("if sRGB ≤ color-gamut < Rec. 2020");
  expect(toEnglishString(compileQuery("(grid: 0)"))).toEqual(
    "if doesn't use terminal as display"
  );
  expect(toEnglishString(compileQuery("(grid: 1)"))).toEqual(
    "if uses terminal as display"
  );
  expect(toEnglishString(compileQuery("(grid)"))).toEqual(
    "if uses terminal as display"
  );
  expect(toEnglishString(compileQuery("not (grid)"))).toEqual(
    "if doesn't use terminal as display"
  );
  expect(toEnglishString(compileQuery("(orientation)"))).toEqual("always");
  expect(toEnglishString(compileQuery("not (orientation)"))).toEqual("never");
  // TODO: improve this formatting
  expect(toEnglishString(compileQuery("(orientation: landscape)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(orientation: portrait)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(
  //     compileQuery(
  //       "(orientation: portrait) and (orientation: landscape)"
  //     )
  //   )
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("(orientation)"))).toEqual("");
  // expect(toEnglishString(compileQuery("not (orientation)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(orientation: landscape)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(orientation: portrait)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("(orientation)"))).toEqual("");
  // expect(toEnglishString(compileQuery("not (orientation)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(orientation: landscape)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(orientation: portrait)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("(aspect-ratio: 1/1)"))).toEqual(
  //   ""
  // );
  // expect(
  //   toEnglishString(compileQuery("(max-aspect-ratio: 2/1)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(min-aspect-ratio: 1/2)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(min-aspect-ratio: 2/1)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(aspect-ratio = 1280/800)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(1280/800 = aspect-ratio)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(16/10 <= aspect-ratio <= 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(16/10 < aspect-ratio <= 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(16/10 <= aspect-ratio < 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(16/10 < aspect-ratio < 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(aspect-ratio < 1/100000)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(aspect-ratio > 1/100000)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("(aspect-ratio > 1)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(aspect-ratio > 0.5)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(color-index > 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(color-index: 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(color-index < 129)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(color-index)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(color-index > 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(color-index: 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(color-index <= 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(color-index)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome > 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome: 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome < 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome > 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome: 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome <= 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome > 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome: 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome <= 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome: 1)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome > 1)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(any-hover)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(any-hover: none)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(any-hover: hover)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(any-pointer)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(any-pointer: none)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(any-pointer: coarse)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(any-pointer: fine)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(overflow-block)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(overflow-block: none)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(overflow-block: scroll)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(overflow-block: paged)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("(overflow-inline)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(overflow-inline: none)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(overflow-inline: scroll)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("(scan)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(scan: interlace)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(scan: progressive)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(update)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(update: none)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(update: slow)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(update: fast)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(update)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(update: none)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(update: slow)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(color)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(color: 8)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(min-color: 4)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(color: 0)"))).toEqual("");
  // expect(toEnglishString(compileQuery("not (color)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(device-aspect-ratio)"))).toEqual(
  //   ""
  // );
  // expect(
  //   toEnglishString(compileQuery("(device-aspect-ratio: 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(min-device-aspect-ratio: 1)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(device-aspect-ratio: 1/2)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("not (device-aspect-ratio)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("(height: 800px)"))).toEqual("");
  // expect(toEnglishString(compileQuery("(max-height: 1000px)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("(min-height: 1000px)"))).toEqual(
  //   ""
  // );
  // expect(
  //   toEnglishString(compileQuery("(device-width: 1280px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(max-device-width: 1000px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(min-device-width: 1000px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(device-height: 800px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(max-device-height: 1000px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("(min-device-height: 1000px)"))
  // ).toEqual("");
});
