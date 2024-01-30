#!/usr/bin/env node

const currentVersion = process.versions.node;
const nodeVersionRequired = 16;

//check if current nodejs version is above the needed version of 16
//todo: check for aoi.db (>=20)
if (currentVersion.split(".")[0] < nodeVersionRequired) {
  console.error(`Node.js v${currentVersion.split(".")[0]} is out of date and unsupported!`);
  console.log(`Please use Node.js v${nodeVersionRequired} or higher.`);
  process.exit(1);
}

//if above 16 then continue
import("./dist/index.js")
