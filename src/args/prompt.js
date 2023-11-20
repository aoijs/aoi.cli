#! /usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import * as installer from "../../src/helpers/cmd.js";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function promptUser() {
  return await inquirer.prompt([
    {
      type: "input",
      name: "directory",
      message: "project directory:",
      default: "./aoijs",
    },
    {
      type: "input",
      name: "token",
      message: "discord bot token:",
      transformer: (input) => {
        return input.indexOf(".") !== -1
          ? input.substring(0, input.indexOf(".")) +
              "*".repeat(input.length - input.indexOf("."))
          : input;
      },
    },
    {
      type: "input",
      name: "prefix",
      message: "discord bot prefix:",
      default: "!",
    },
    {
      type: "list",
      name: "setup",
      message: "template",
      choices: ["default", "default with handler", "sharding"],
      default: "default",
    },
    {
      type: "confirm",
      name: "install-deps",
      message: "pre-install packages?",
      default: "Yes",
    },
    {
      type: "confirm",
      name: "install-aoimusic",
      message: "install aoi.music?",
      default: "Yes",
    },
  ]);
}

async function modifyIndex(answers, directoryPath) {
  const { prefix, token, setup, "install-aoimusic": useMusic } = answers;

  let mainFileContent = fs
    .readFileSync(path.join(__dirname, "../template/index.template.js"), "utf8")
    .replace(/{TOKEN}/g, token)
    .replace(/{PREFIX}/g, prefix);

  let shardingFileContent = fs
    .readFileSync(
      path.join(__dirname, "../template/sharding.template.js"),
      "utf8"
    )
    .replace(/{TOKEN}/g, token)
    .replace(/{PREFIX}/g, prefix);

  let handlerFileContent = fs
    .readFileSync(
      path.join(__dirname, "../template/handler.template.js"),
      "utf8"
    )
    .replace(/{TOKEN}/g, token)
    .replace(/{PREFIX}/g, prefix);
  let handlerExampleContent = fs.readFileSync(
    path.join(__dirname, "../template/handler-example.template.js"),
    "utf8"
  );
  let aoimusicsetup = fs
    .readFileSync(
      path.join(__dirname, "../template/aoi-music.template.js"),
      "utf8"
    )
    .split("//---");

  fs.writeFileSync(
    path.join(directoryPath, "index.js"),
    setup === "default with handler" ? handlerFileContent : mainFileContent
  );

  if (
    setup === "default with handler" &&
    !fs.existsSync(path.join(directoryPath, "commands"))
  ) {
    fs.mkdirSync(path.join(directoryPath, "commands"), { recursive: true });
    fs.writeFileSync(
      path.join(directoryPath, "commands", "ping.js"),
      handlerExampleContent
    );
  }

  if (useMusic) {
    const [aoiMusicSetupStart, ...aoiMusicSetupEnd] = aoimusicsetup;
    fs.writeFileSync(
      path.join(directoryPath, "index.js"),
      `${aoiMusicSetupStart}\n${fs.readFileSync(
        path.join(directoryPath, "index.js"),
        "utf8"
      )}`
    );
    fs.appendFileSync(
      path.join(directoryPath, "index.js"),
      `\n${aoiMusicSetupEnd.join("\n\n")}`
    );
  }

  if (answers.setup === "sharding") {
    fs.writeFileSync(
      path.join(directoryPath, "sharding.js"),
      shardingFileContent
    );
  }
}

async function installPackage(answers) {
  await installer.execute("npm init -y");

  if (answers["install-deps"]) {
    console.log("\n\rInstalling now all needed packages...");
    await installer.install("aoi.js");
  }

  if (answers["install-aoimusic"]) {
    await installer.install("@akarui/aoi.music");
    console.log("\n\rInstalling now all needed dependencies for aoi.music...");
    await installer.install("opusscript", "Installing opusscript");
    await installer.install("ffmpeg-static", "Installing ffmpeg-static");
  }
}

try {
  const { directory, ...answers } = await promptUser();

  const directoryPath = path.resolve(directory);

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  process.chdir(directoryPath);
  modifyIndex(answers, directoryPath);
  await installPackage(answers);

  fs.writeFileSync(
    path.join(directoryPath, "package.json"),
    JSON.stringify(
      {
        ...JSON.parse(
          fs.readFileSync(path.join(directoryPath, "package.json"), "utf-8")
        ),
        main: answers.setup === "Sharding" ? "./sharding.js" : "./index.js",
      },
      null,
      2
    )
  );

  console.log(
    `\n\rYou can now start your bot using the command \`node .\`\n\rIf you have any issues feel free to join our Discord (${chalk.blue.underline(
      "https://aoi.js.org/invite"
    )}) or check our documentation (${chalk.blue.underline(
      "https://aoi.js.org/"
    )}).`
  );
} catch (error) {
  console.error("Something went wrong, failed to handle:", error);
}
