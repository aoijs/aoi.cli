import { promisify } from "util";
import { exec } from 'child_process';
import ora from "ora";
import chalk from "chalk";

const execAsync = promisify(exec);

export async function execute(cmd) {
  try {
    await execAsync(cmd);
  } catch {
    console.error(`\n\r${chalk.red("✖")} Failed to execute ${chalk.cyan(cmd)}.`);
    process.exit(1);
  } // todo: improve error handling
}

export async function install(pkg, text = `Installing ${chalk.bold(pkg)}`, global = false) {
  const spinner = ora(text).start();
  let installs;
  try { installs = JSON.parse((await execAsync(`npm list --depth=0 ${pkg} --json`)).stdout) } catch (e) { installs = {} };

  if (checkNodeJS(process.versions.node, "20.0.0") === -1) {
    spinner.fail(`Your Node.js version (${chalk.cyan(process.versions.node)}) is below the recommended version (${chalk.cyan("20.0.0")}).`);
    process.exit(1);
  }

  try {
    if (installs?.dependencies && installs?.dependencies[pkg]) {
      spinner.info(`Up-to-Date ${chalk.bold(pkg + chalk.grey(" v" + installs.dependencies[pkg].version))}`);
    } else {
      await execAsync(`npm install ${pkg} ${global === true ? "-g" : ""}`);
      spinner.succeed(`Installed ${chalk.bold.cyan(pkg)}`);
    }
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
