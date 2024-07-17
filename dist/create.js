#!/usr/bin/env node
import process from "node:process";
import picocolors from "picocolors";
import { execSync } from "node:child_process";
import { askDirectory, askToken } from "./helpers/request.js";
import { extractArgs } from "./helpers/args.js";
import { readFileSync, writeFileSync } from "fs";
import { cp } from "fs/promises";
import { join, relative } from "path";
const packageManager = process.env.npm_config_user_agent ?? "npm";
function replaceContent(filePath, replaceFrom, replaceTo) {
    const file = readFileSync(filePath, "utf-8");
    const content = file.replace(replaceFrom, replaceTo);
    writeFileSync(filePath, content);
}
async function create() {
    const flags = extractArgs(process.argv);
    console.log(picocolors.bold(`🚀 Creating a new project using ${packageManager}...`));
    const directory = flags.dir ? join(process.cwd(), flags.dir.toString()) : await askDirectory();
    const token = await askToken();
    const template = new URL("../template", import.meta.url);
    await cp(template, directory.toString(), { recursive: true });
    replaceContent(join(directory.toString(), "./.env"), "[REPLACE_THIS_TOKEN]", token ? token : "Your Discord Bot Token goes here!");
    console.log();
    console.log(picocolors.green(`Project created in '${relative(process.cwd(), directory.toString())}'`));
    console.log();
    if (flags.noInstall) {
        console.log(`${picocolors.gray("--noInstall")} Skipping the installation of dependencies.`);
    }
    else {
        console.log("Installing dependencies...");
        execSync(`${packageManager} install`, { cwd: directory.toString(), stdio: "inherit" });
    }
    console.log();
    console.log(`${picocolors.cyan("All done!")} Happy coding!`);
    console.log(`Make sure to read the docs at ${picocolors.underline("https://aoi.js.org")}, or join the support server at ${picocolors.underline("https://aoi.js.org/invite")}`);
    if (!token) {
        console.log();
        console.log(`${picocolors.red("Note:")} You need to replace the token in the .env file with your bot token.`);
    }
}
create();
