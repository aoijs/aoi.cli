#! /usr/bin/env node

import chalk from "chalk";

console.log(`
Usage: ${chalk.cyan("create-aoijs-bot")} [options]

Options:
${chalk.cyan("--help")}               Display this help message
${chalk.cyan("--version")}            Displays the current version of this tool
${chalk.cyan("--[no args]")}          Start the interactive Discord Bot Setup
`);
