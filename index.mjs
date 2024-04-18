#!/usr/bin/env node

import chalk from "chalk";

const currentVersion = process.versions.node;
const nodeVersionRequired = 16;

/*

-- Node version 16 is the minimum requirement for aoi.js, this doesn't take into account the minimum version required for the dependencies, aoi.db to be specific. Therefore it may be a good idea to check the minimum version required for the dependencies as well. I'm unsure how I'm going to implement a check for that, but for not this should be fine.

-- Anything below node version 10 breaks console logs, I thought about still allowing displaying the help message but the error messages and help messages break completely. Therefore I'm going to force the user to upgrade to node version 16 or higher.

*/

if (currentVersion.split(".")[0] < nodeVersionRequired) {
    console.error(chalk.red(`Error: Node.js v${currentVersion.split(".")[0]} is out of date and unsupported!`));
    console.log(chalk.yellow(`Please upgrade to Node.js v${nodeVersionRequired} or higher.`));

    process.exit(1);
}

import("./dist/index.js");
