#! /usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import * as installer from "../src/helpers/install.js";
import path from "path";
import chalk from "chalk";
import { execFile } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let debug = process.argv.includes("--debug");

if (process.argv.includes("--help")) {
  execFile(
    "node",
    [`${path.join(__dirname, "../src/args/help.js")}`],
    (error, stdout, stderr) => {
      console.log(stdout);
    }
  );
} else {
  async function promptUser() {
    if (debug) {
      console.log(
        `${chalk.bgYellow(
          "--debug"
        )} Debugging is enabled, therefore verbose logs will be shown in the console.\n\r`
      );
    }

    const questions = [
      {
        type: "input",
        name: "directory",
        message: "Enter the directory path where you want to generate files:",
        default: "./",
      },
      {
        type: "input",
        name: "token",
        message: "Enter your Discord Bot Token:",
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
        message: "Enter your Discord Bot Prefix:",
        default: "!",
      },
      {
        type: "list",
        name: "setup",
        message: "Which setup would you like to continue with?",
        choices: ["Default", "Default with Handler", "Sharding"],
        default: "Default",
      },
      {
        type: "confirm",
        name: "install-deps",
        message: "Do you want to install all needed packages (aoi.js)?",
        default: "Yes",
      },
      {
        type: "confirm",
        name: "install-aoimusic",
        message: "Do you want to use aoi.music?",
        default: "Yes",
      },
    ];

    return await inquirer.prompt(questions);
  }

  async function modifyIndex(answers, directoryPath) {
    const {
      prefix,
      token,
      setup,
      "install-aoimusic": installaoimusic,
    } = answers;

    let mainFileContent = fs
      .readFileSync(
        path.join(__dirname, "../src/template/index.template.js"),
        "utf8"
      )
      .replace(/{TOKEN}/g, token)
      .replace(/{PREFIX}/g, prefix);

    let shardingFileContent = fs
      .readFileSync(
        path.join(__dirname, "../src/template/sharding.template.js"),
        "utf8"
      )
      .replace(/{TOKEN}/g, token)
      .replace(/{PREFIX}/g, prefix);

    let handlerFileContent = fs
      .readFileSync(
        path.join(__dirname, "../src/template/handler.template.js"),
        "utf8"
      )
      .replace(/{TOKEN}/g, token)
      .replace(/{PREFIX}/g, prefix);
    let handlerExampleContent = fs.readFileSync(
      path.join(__dirname, "../src/template/handler-example.template.js"),
      "utf8"
    );
    let aoimusicsetup = fs
      .readFileSync(
        path.join(__dirname, "../src/template/aoi-music.template.js"),
        "utf8"
      )
      .split("//---");

    fs.writeFileSync(
      path.join(directoryPath, "index.js"),
      setup === "Default with Handler" ? handlerFileContent : mainFileContent
    );

    if (
      setup === "Default with Handler" &&
      !fs.existsSync(path.join(directoryPath, "commands"))
    ) {
      fs.mkdirSync(path.join(directoryPath, "commands"), { recursive: true });
      fs.writeFileSync(
        path.join(directoryPath, "commands", "ping.js"),
        handlerExampleContent
      );
    }

    if (installaoimusic) {
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

    if (answers.setup === "Sharding") {
      fs.writeFileSync(
        path.join(directoryPath, "sharding.js"),
        shardingFileContent
      );
    }
  }

  async function installPackage(answers) {
    await clearLines(7);
    await installer.execute("npm init -y", debug);

    if (answers["install-deps"]) {
      console.log("\n\rInstalling now all needed packages...");
      await installer.install("aoi.js", debug);
    }

    if (answers["install-aoimusic"]) {
      await installer.install("@akarui/aoi.music", debug);
      console.log(
        "\n\rInstalling now all needed dependencies for aoi.music..."
      );
      await installer.install("opusscript", debug, "Installing opusscript");
      await installer.install(
        "ffmpeg-static",
        debug,
        "Installing ffmpeg-static"
      );
    }
  }

  async function main() {
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
  }

  main();
}

function clearLines(numOfLines) {
  const moveCursorUp = (n) => `\x1B[${n}A`;
  const clearCurrentLine = "\x1B[0K";

  process.stdout.write(clearCurrentLine);

  return new Promise((resolve) => {
    let cleared = 0;
    const clearLinesInterval = setInterval(() => {
      if (cleared >= numOfLines) {
        clearInterval(clearLinesInterval);
        resolve();
      } else {
        process.stdout.write(moveCursorUp(1) + clearCurrentLine);
        cleared++;
      }
    }, 50);
  });
}
