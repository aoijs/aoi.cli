#!/usr/bin/env node

import * as installer from "../../src/helpers/cmd.js";
import { fileURLToPath } from "url";

import chalk from "chalk";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import PressToContinuePrompt from "inquirer-press-to-continue";

inquirer.registerPrompt("press-to-continue", PressToContinuePrompt);

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
  const { key: enterKey } = await inquirer.prompt({
    name: "key",
    type: "press-to-continue",
    enter: true,
    message: "Press Enter to continue...",
  });
};

(async () => {
  if (await checkpkgoutdated("create-aoijs-bot")) {
    console.log(
      `A newer version (${chalk.cyan(
        "v" + latestVersion
      )}) is available to download, do you wish to continue?`
    );
    await continueInstall();
    await installer.install("create-aoijs-bot@latest", `Updating ${chalk.bold("create-aoijs-bot")}`,  true);
    console.log(
      `\n\rSuccessfully updated to the latest version (${chalk.cyan(
        "v" + latestVersion
      )}).`
    );
  }
})();
