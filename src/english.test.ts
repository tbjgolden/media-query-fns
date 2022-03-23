import { compileQuery } from "./compile";
import { toEnglishData, toEnglishString } from "./english";
import util from "util";
const log = (x: any) =>
  console.log(
    util.inspect(x, {
      depth: 10,
      colors: true,
    })
  );

test("toEnglishData", () => {
  expect(toEnglishData(compileQuery("(min-width: 120px)"))).toEqual({
    invalidFeatures: [],
    neverFeatures: [],
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
        "not screen and (min-width: 1000px) and (min-aspect-ratio: 2)"
      )
    )
  ).toEqual(
    "if not a screen OR (is screen AND width < 1000px AND is portrait)"
  );
  expect(toEnglishString(compileQuery("(min-width: 120px)"))).toEqual(
    "if 120px ≤ width"
  );
  expect(toEnglishString(compileQuery("@media (width: 1280px)"))).toEqual(
    "if width = 1280px"
  );
  expect(toEnglishString(compileQuery("@media (max-width: 1400px)"))).toEqual(
    "if width ≤ 1400px"
  );
  expect(toEnglishString(compileQuery("@media (min-width: 1000px)"))).toEqual(
    "if 1000px ≤ width"
  );
  expect(toEnglishString(compileQuery("@media (min-width: 1400px)"))).toEqual(
    "if 1400px ≤ width"
  );
  expect(toEnglishString(compileQuery("@media (width = 1280px)"))).toEqual(
    "if width = 1280px"
  );
  expect(toEnglishString(compileQuery("@media (1280px = width)"))).toEqual(
    "if width = 1280px"
  );
  expect(
    toEnglishString(compileQuery("@media (1280px <= width <= 1280px)"))
  ).toEqual("if width = 1280px");
  expect(
    toEnglishString(compileQuery("@media (1280px < width <= 1280px)"))
  ).toEqual("never");
  expect(
    toEnglishString(compileQuery("@media (1280px <= width < 1280px)"))
  ).toEqual("never");
  expect(
    toEnglishString(compileQuery("@media (1280px < width < 1280px)"))
  ).toEqual("never");
  expect(
    toEnglishString(compileQuery("@media (1279.9px < width < 1280.1px)"))
  ).toEqual("if 1279.9px < width < 1280.1px");
  expect(toEnglishString(compileQuery("@media (12in < width < 35cm)"))).toEqual(
    "if 1152px < width < 1322.835px"
  );
  expect(
    toEnglishString(compileQuery("@media (100000Q < width < 101vw)"))
  ).toEqual("if 944.882px < width < 1939.2px");
  expect(
    toEnglishString(compileQuery("@media (-1px < width < 10000px)"))
  ).toEqual("if width < 10000px");
  expect(toEnglishString(compileQuery("@media (-1px > width)"))).toEqual(
    "never"
  );
  expect(toEnglishString(compileQuery("@media all"))).toEqual("always");
  expect(toEnglishString(compileQuery("@media not all"))).toEqual("never");
  expect(
    toEnglishString(compileQuery("@media not all and (width > 1px)"))
  ).toEqual("if width ≤ 1px");
  expect(
    toEnglishString(compileQuery("@media not all and (width < 1px)"))
  ).toEqual("if 1px ≤ width");
  expect(toEnglishString(compileQuery("@media tty"))).toEqual("never");
  expect(toEnglishString(compileQuery("@media not tty"))).toEqual("always");
  expect(toEnglishString(compileQuery("@media screen"))).toEqual(
    "if is screen"
  );
  expect(toEnglishString(compileQuery("@media print"))).toEqual("if printing");
  expect(toEnglishString(compileQuery("@media not screen"))).toEqual(
    "if not a screen"
  );
  expect(toEnglishString(compileQuery("@media not print"))).toEqual(
    "if not printing"
  );
  expect(toEnglishString(compileQuery("@media (resolution)"))).toEqual(
    "if 0x < resolution"
  );
  expect(toEnglishString(compileQuery("@media not (resolution)"))).toEqual(
    "if resolution = 0x"
  );
  expect(
    toEnglishString(compileQuery("@media (max-resolution: 128dpi)"))
  ).toEqual("if resolution ≤ 1.333x");
  expect(
    toEnglishString(compileQuery("@media (min-resolution: 10dpcm)"))
  ).toEqual("if 0.265x ≤ resolution");
  expect(toEnglishString(compileQuery("@media (resolution: 2x)"))).toEqual(
    "if resolution = 2x"
  );
  expect(toEnglishString(compileQuery("@media (resolution: 2dppx)"))).toEqual(
    "if resolution = 2x"
  );
  expect(toEnglishString(compileQuery("@media (min-resolution: 3x)"))).toEqual(
    "if 3x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("@media (max-resolution: 1x)"))).toEqual(
    "if resolution ≤ 1x"
  );
  expect(toEnglishString(compileQuery("@media (min-resolution: 1x)"))).toEqual(
    "if 1x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("@media (max-resolution: 3x)"))).toEqual(
    "if resolution ≤ 3x"
  );
  expect(toEnglishString(compileQuery("@media (min-resolution: 2x)"))).toEqual(
    "if 2x ≤ resolution"
  );
  expect(toEnglishString(compileQuery("@media (max-resolution: 2x)"))).toEqual(
    "if resolution ≤ 2x"
  );
  expect(toEnglishString(compileQuery("@media (hover)"))).toEqual(
    "if primary input supports hover"
  );
  expect(toEnglishString(compileQuery("@media not (hover)"))).toEqual(
    "if primary input doesn't support hover"
  );
  expect(toEnglishString(compileQuery("@media (hover: none)"))).toEqual(
    "if primary input doesn't support hover"
  );
  expect(toEnglishString(compileQuery("@media (hover: hover)"))).toEqual(
    "if primary input supports hover"
  );
  expect(toEnglishString(compileQuery("@media (pointer)"))).toEqual(
    "if primary pointing device is imprecise OR primary pointing device is precise"
  );
  expect(toEnglishString(compileQuery("@media not (pointer)"))).toEqual(
    "if no pointing device"
  );
  expect(toEnglishString(compileQuery("@media (pointer: none)"))).toEqual(
    "if no pointing device"
  );
  expect(toEnglishString(compileQuery("@media (pointer: coarse)"))).toEqual(
    "if primary pointing device is imprecise"
  );
  expect(toEnglishString(compileQuery("@media (pointer: fine)"))).toEqual(
    "if primary pointing device is precise"
  );
  expect(toEnglishString(compileQuery("@media (color-gamut)"))).toEqual(
    "if sRGB ≤ color-gamut"
  );
  expect(toEnglishString(compileQuery("@media not (color-gamut)"))).toEqual(
    "if color-gamut < sRGB"
  );
  expect(toEnglishString(compileQuery("@media (color-gamut: srgb)"))).toEqual(
    "if sRGB ≤ color-gamut"
  );
  expect(toEnglishString(compileQuery("@media (color-gamut: p3)"))).toEqual(
    "if P3 ≤ color-gamut"
  );
  expect(
    toEnglishString(compileQuery("@media (color-gamut: rec2020)"))
  ).toEqual("if Rec. 2020 ≤ color-gamut");
  expect(
    toEnglishString(
      compileQuery(
        "@media (color-gamut: srgb) and (not (color-gamut: rec2020))"
      )
    )
  ).toEqual("if sRGB ≤ color-gamut < Rec. 2020");
  expect(toEnglishString(compileQuery("@media (grid: 0)"))).toEqual(
    "if doesn't use terminal as display"
  );
  expect(toEnglishString(compileQuery("@media (grid: 1)"))).toEqual(
    "if uses terminal as display"
  );
  expect(toEnglishString(compileQuery("@media (grid)"))).toEqual(
    "if uses terminal as display"
  );
  expect(toEnglishString(compileQuery("@media not (grid)"))).toEqual(
    "if doesn't use terminal as display"
  );
  expect(toEnglishString(compileQuery("@media (orientation)"))).toEqual(
    "always"
  );
  expect(toEnglishString(compileQuery("@media not (orientation)"))).toEqual(
    "never"
  );
  // TODO: improve this formatting
  expect(
    toEnglishString(compileQuery("@media (orientation: landscape)"))
  ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (orientation: portrait)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(
  //     compileQuery(
  //       "@media (orientation: portrait) and (orientation: landscape)"
  //     )
  //   )
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("@media (orientation)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media not (orientation)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (orientation: landscape)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (orientation: portrait)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("@media (orientation)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media not (orientation)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (orientation: landscape)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (orientation: portrait)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("@media (aspect-ratio: 1/1)"))).toEqual(
  //   ""
  // );
  // expect(
  //   toEnglishString(compileQuery("@media (max-aspect-ratio: 2/1)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (min-aspect-ratio: 1/2)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (min-aspect-ratio: 2/1)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (aspect-ratio = 1280/800)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (1280/800 = aspect-ratio)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (16/10 <= aspect-ratio <= 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (16/10 < aspect-ratio <= 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (16/10 <= aspect-ratio < 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (16/10 < aspect-ratio < 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (aspect-ratio < 1/100000)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (aspect-ratio > 1/100000)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("@media (aspect-ratio > 1)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (aspect-ratio > 0.5)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (color-index > 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (color-index: 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (color-index < 129)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (color-index)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (color-index > 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (color-index: 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (color-index <= 128)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (color-index)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome > 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome: 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome < 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome > 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome: 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome <= 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome > 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome: 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome <= 2)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome: 1)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome > 1)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (monochrome)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (any-hover)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (any-hover: none)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (any-hover: hover)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (any-pointer)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (any-pointer: none)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (any-pointer: coarse)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (any-pointer: fine)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (overflow-block)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (overflow-block: none)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (overflow-block: scroll)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (overflow-block: paged)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("@media (overflow-inline)"))).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (overflow-inline: none)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (overflow-inline: scroll)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("@media (scan)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (scan: interlace)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (scan: progressive)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (update)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (update: none)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (update: slow)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (update: fast)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (update)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (update: none)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (update: slow)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (color)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (color: 8)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (min-color: 4)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (color: 0)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media not (color)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (device-aspect-ratio)"))).toEqual(
  //   ""
  // );
  // expect(
  //   toEnglishString(compileQuery("@media (device-aspect-ratio: 16/10)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (min-device-aspect-ratio: 1)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (device-aspect-ratio: 1/2)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media not (device-aspect-ratio)"))
  // ).toEqual("");
  // expect(toEnglishString(compileQuery("@media (height: 800px)"))).toEqual("");
  // expect(toEnglishString(compileQuery("@media (max-height: 1000px)"))).toEqual(
  //   ""
  // );
  // expect(toEnglishString(compileQuery("@media (min-height: 1000px)"))).toEqual(
  //   ""
  // );
  // expect(
  //   toEnglishString(compileQuery("@media (device-width: 1280px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (max-device-width: 1000px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (min-device-width: 1000px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (device-height: 800px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (max-device-height: 1000px)"))
  // ).toEqual("");
  // expect(
  //   toEnglishString(compileQuery("@media (min-device-height: 1000px)"))
  // ).toEqual("");
});
