import { spawn } from "child_process";
import { fileURLToPath } from "url";

import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function execute(arg) {
  if (arg.includes("--help")) {
    spawn("node", [path.join(__dirname, "../args/help.js")], {
      stdio: "inherit",
    });
  } else if (arg.includes("--version")) {
    spawn("node", [path.join(__dirname, "../args/version.js")], {
      stdio: "inherit",
    });
  } else {
    spawn("node", [path.join(__dirname, "../args/prompt.js")], {
      stdio: "inherit",
    });
  }
}
