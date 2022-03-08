#!/usr/bin/env node

import { hello } from "media-query-fns";

const [_cmd, _fileName, ...args] = process.argv;
const arg = args.join(" ");

if (arg !== "") {
  console.log(hello(arg));
}
