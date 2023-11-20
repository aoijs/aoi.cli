#! /usr/bin/env node

import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json"), "utf8"));

console.log(`${chalk.cyan("v" + version)}`);