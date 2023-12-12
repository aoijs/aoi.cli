#!/usr/bin/env node

import * as installer from "../../src/helpers/cmd.js";
import { fileURLToPath } from "url";

import chalk from "chalk";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let latestVersion;
const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../package.json"), "utf8")
);

console.log(`${chalk.cyan("v" + version)}`);

const checkpkgoutdated = async (pkg) => {
  try {
    const response = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
    const data = await response.json();

    latestVersion = data.version;
    return latestVersion !== version;
  } catch {
    return false;
  }
};

const continueInstall = async () => {
  const response = await inquirer.prompt([
    {
      name: "continue",
      type: "list",
      message: `A newer version (${chalk.cyan("v" + latestVersion)}) is available to download, do you wish to continue?`,
      choices: ["No", "Yes"],
      prefix: `\n\r${chalk.bgYellow(" update ")}`
    },
  ]);
  return response.continue === "Yes";
};

(async () => {
  if (await checkpkgoutdated("create-aoijs-bot")) {
    const shouldContinue = await continueInstall();
    if (shouldContinue) {
      await installer.install("create-aoijs-bot@latest", `Updating ${chalk.bold("create-aoijs-bot")}`,  true);
      console.log(
        `\n\rSuccessfully updated to the latest version (${chalk.cyan(
          "v" + latestVersion
        )}).`
      );
    } else {
      console.log("Cancelled action.")
    }
  }
})();
