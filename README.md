# `media-query-fns`

[![npm version](https://img.shields.io/npm/v/media-query-fns.svg?style=flat-square)](https://www.npmjs.com/package/media-query-fns)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/media-query-fns?style=flat-square)
[![test coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&color=brightgreen&label=coverage&query=%24.total.branches.pct&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftbjgolden%2Fmedia-query-fns%2Fmain%2Fcoverage%2Fcoverage-summary.json)](https://www.npmjs.com/package/media-query-fns)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tbjgolden/media-query-fns/Release?style=flat-square)](https://github.com/tbjgolden/media-query-fns/actions?query=workflow%3ARelease)

Functions to read media queries from a string/ast and:

- [x] Check if a media query is true for a custom environment
  - [x] Backed up by [hundreds of unit tests](https://github.com/tbjgolden/media-query-fns/blob/main/src/matches.test.ts)
- [x] Converts a media query to a human friendly description

Based on [media-query-parser](https://github.com/tbjgolden/media-query-parser) which means:

- [x] **parses any correct CSS media queries**
- [x] **spec-compliant everything** - https://www.w3.org/TR/mediaqueries-4/
- [x] **TypeScript friendly**
- [x] **all valid queries parsed and interpreted, even newer syntax like
      `@media (100px < width < 200px)` or complex ones like `@media not screen and ((not (update: none)) and (monochrome))`**

## Quickfire examples

```ts
import { compileQuery, matches, toEnglishString } from "media-query-fns";

// returns data that can be used to interpret the query
const maxWidthQuery = compileQuery(`@media (max-width: 1200px)`);
// (throws if invalid query syntax)

const testEnv = (widthPx = 1280, heightPx = 800) => ({
  widthPx,
  heightPx,
  deviceWidthPx: widthPx,
  deviceHeightPx: heightPx,
  dppx: 2,
});
console.log(matches(maxWidthQuery, testEnv(1280))); // false
console.log(matches(maxWidthQuery, testEnv(1000))); // true

const complexQuery = compileQuery(
  `@media screen and (8 = color) and (orientation)`
);
console.log(matches(complexQuery, testEnv()));
// true

console.log(toEnglishString(maxWidthQuery));
// 'if width ≤ 1200px'
console.log(toEnglishString(complexQuery));
// 'if (is screen AND color = 24-bit)'
// note: (orientation) is always true, so it's removed for brevity
```

## Considerations & Caveats

This library doesn't support calc because it [follows the spec](https://www.w3.org/TR/mediaqueries-4/#ref-for-media-feature%E2%91%A0%E2%93%AA).

Many browsers do support calc to some extent, but they probably shouldn't as it opens up a Pandora's box of nasty edge cases that would lead to browser inconsistencies (without a spec to unify them, anyway).

## Installation

```sh
npm install media-query-fns --save
# yarn add media-query-fns
```

<!-- ## [`API`](docs/api) -->

## License

MIT
