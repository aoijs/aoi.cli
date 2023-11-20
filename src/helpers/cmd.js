import { promisify } from "util";
import { exec as execCallback } from "child_process";
import ora from "ora";
import chalk from "chalk";

const exec = promisify(execCallback);

export async function execute(cmd) {
  try {
    await exec(cmd, { stdio: "ignore" });
  } catch {
    console.error(`\n\r${chalk.red("✖")} Failed to execute ${chalk.cyan(cmd)}.`);
    process.exit(1);
  } // todo: improve error handling
}

export async function install(pkg, text = `Installing ${chalk.bold(pkg)}`) {
  const spinner = ora(text).start();

  if (checkNodeJS(process.versions.node, "16.9.0") === -1) {
    spinner.fail(`Your Node.js version (${chalk.cyan(process.versions.node)}) is below the recommended version (${chalk.cyan("16.9.0")}).`);
    process.exit(1);
  }

  try {
    await exec(`npm install ${pkg} --save`, { stdio: ["ignore", "pipe", "ignore"]  });
    spinner.succeed(`Installed ${chalk.bold.cyan(pkg)}`);
  } catch (error) {
    spinner.fail(`Failed to install ${chalk.bold.cyan(pkg)}`);
  }
}

function checkNodeJS(a, b) {
  const userNodeVersion = a.split(".").map(Number);
  const recommendedNodeVersion = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const diff = userNodeVersion[i] - recommendedNodeVersion[i];
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }

  return 0;
}
