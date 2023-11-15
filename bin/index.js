#! /usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import * as installer from "../src/helpers/install.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Prompts the user with a series of questions to generate files for a Discord bot.
 * @async
 * @function
 * @returns {Promise<Object>} An object containing the user's responses to the questions.
 */
async function promptUser() {
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
        return input.indexOf(".") !== -1 ? input.substring(0, input.indexOf(".")) + "*".repeat(input.length - input.indexOf(".")) : input;
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
      default: "Default"
    },
    {
      type: "confirm",
      name: "install-deps",
      message: "Do you want to install all needed packages (aoi.js)?",
    },
    {
      type: "confirm",
      name: "install-aoimusic",
      message: "Do you want to use aoi.music?",
    },
  ];

  return await inquirer.prompt(questions);
}

/**
 * Edits the index file based on the provided answers and directory path.
 * @param {Object} answers - An object containing the user's answers.
 * @param {string} directoryPath - The path to the directory where the index file will be created.
 * @returns {Promise<void>} - A Promise that resolves when the index file has been successfully edited.
 */
async function modifyIndex(answers, directoryPath) {
  const { prefix, token, setup, "install-aoimusic": installaoimusic } = answers;

  let mainFileContent = fs.readFileSync(path.join(__dirname, "../src/template/index.template.js"), "utf8");
  let shardingFileContent = fs.readFileSync(path.join(__dirname, "../src/template/sharding.template.js"), "utf8");
  let handlerFileContent = fs.readFileSync(path.join(__dirname, "../src/template/handler.template.js"), "utf8");
  let handlerExampleContent = fs.readFileSync(path.join(__dirname, "../src/template/handler-example.template.js"), "utf8");
  let aoimusicsetup = fs.readFileSync(path.join(__dirname, "../src/template/aoi-music.template.js"), "utf8").split("\/\/---");

  mainFileContent = mainFileContent.replace("{TOKEN}", token).replace("{PREFIX}", prefix);
  shardingFileContent = shardingFileContent.replace("{TOKEN}", token).replace("{PREFIX}", prefix);
  handlerFileContent = handlerFileContent.replace("{TOKEN}", token).replace("{PREFIX}", prefix);

  fs.writeFileSync(
    path.join(directoryPath, "index.js"),
    setup === "Default with Handler" ? handlerFileContent : mainFileContent
  );

  if (setup === "Default with Handler" && !fs.existsSync(path.join(directoryPath, "commands"))) {
    await fs.mkdirSync(path.join(directoryPath, "commands"), { recursive: true });
    fs.writeFileSync(path.join(directoryPath, "commands", "ping.js"), handlerExampleContent);
  }

  if (installaoimusic) {
    const [aoiMusicSetupStart, ...aoiMusicSetupEnd] = aoimusicsetup;
    fs.writeFileSync(
      path.join(directoryPath, "index.js"),
      `${aoiMusicSetupStart}\n${fs.readFileSync(path.join(directoryPath, "index.js"), "utf8")}`
    );
    fs.appendFileSync(path.join(directoryPath, "index.js"), `\n${aoiMusicSetupEnd.join("\n\n")}`);
  }

  if (answers.setup === "Sharding") {
    fs.writeFileSync(path.join(directoryPath, "sharding.js"), shardingFileContent);
  }
}

/**
 * Installs necessary packages for the bot.
 * @param {Object} answers - An object containing user answers.
 * @returns {Promise<void>}
 */
async function installPackage(answers) {
  await installer.execute("npm init -y");

  if (answers["install-deps"]) {
    console.log("\n\rInstalling now all needed packages...")
    await installer.install("aoi.js");
  }

  if (answers["install-aoimusic"]) {
    await installer.install("@akarui/aoi.music");
    console.log("\n\rInstalling now all needed dependencies for aoi.music...")
    await installer.install("opusscript", "Installing opusscript");
    await installer.install("ffmpeg-static", "Installing ffmpeg-static");
  }
}

/**
 * Asynchronous function that prompts the user for input, creates a directory if it doesn"t exist, changes the current working directory to the specified directory, edits the index file, and installs a package.
 * @returns {Promise<void>}
 */
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
      JSON.stringify({
        ...JSON.parse(fs.readFileSync(path.join(directoryPath, "package.json"), "utf-8")),
        main: answers.setup === "Sharding" ? "./sharding.js" : "./index.js"
      }, null, 2)
    );

    console.log("\n\rYou can now start your bot using the command `node .`\n\rIf you have any issues feel free to join our Discord (https://aoi.js.org/invite) or check our documentation (https://aoi.js.org).")
  } catch (error) {
    console.error("Something went wrong, failed to handle:", error);
  }
}

main();
