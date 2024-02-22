// checking for the type of command to be executed

import path from "path";
//@ts-ignore
import { upgrade } from "../dist/upgrade.js";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const input: string[] = process.argv;
const loc: string = path.join(__dirname, "..", input.indexOf("--dir") === -1 ? "./aoijs" : input[input.indexOf("--dir") + 1])

if (input.includes("upgrade")) {
  //@ts-ignore
  upgrade(loc);
} else if (input.includes("create")) {
  // create new aoi.js project
  //@ts-ignore
  import("../dist/create.js");
} else if (input.includes("help")) {
  // list all available commands and current version
  //@ts-ignore
  import("../dist/help.js");
} else {
  // fallback, list all available commands and current version
  //@ts-ignore
  import("../dist/help.js");
}
