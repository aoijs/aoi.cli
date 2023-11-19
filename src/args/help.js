#! /usr/bin/env node

import chalk from "chalk";

console.log(`Usage: ${chalk.cyan("create-aoijs-bot")} [options]\n`);
console.log(`Options:
${chalk.cyan("--help")}               Display this help message
${chalk.cyan("--debug")}              Enable debugging mode for verbose logs
${chalk.cyan("--[no args]")}          Start the interactive prompt`);
