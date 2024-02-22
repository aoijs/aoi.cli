import { execa } from "execa";
import { existsSync } from "node:fs";
import chalk from "chalk";
import path from "path";
import ora, { Ora } from "ora";

let spinner: Ora;

export async function installPackage(packageManager: string, _package: string) {

    const command = packageManager === "yarn"? "add" : "install";
    try {
        spinner = ora(`Upgrading ${chalk.cyan(_package)}`).start();
        await execa(packageManager, [command, _package + "@latest"]);
    } catch (error) {
        console.error("• Failed to update " + _package + " using " + chalk.cyan(packageManager));
        console.error(`If you are using npm, try running: ${chalk.cyan(`npm install ${_package} @latest`)} manually.`);
        process.exit(1)
    } finally {
        spinner.stop().clear();
        console.log(`• Successfully updated ${_package} to latest.`)
    }
}
  
export async function uninstallPackage(packageManager: string, _package: string) {
    const command = packageManager === "yarn"? "remove" : "uninstall";
    try {
        await execa(packageManager, [command, _package]);
    } catch (error) {
        console.error("• Failed to uninstall " + _package + " using " + chalk.cyan(packageManager));
    }
}

export function checkPackageManagerType(loc: string): string {
    if (!existsSync(path.join(loc, "package.json"))) { 
      console.error("• No package.json found.");  
    };
    if (existsSync(path.join(loc, "package-lock.json"))) {
      // check if package manager is npm
      return "npm";
    } else if (existsSync(path.join(loc, "pnpm-lock.yml"))) {
      // check if package manager is pnpm
      return "pnpm";
    } else if (existsSync(path.join(loc, "bun.lockb"))) {
      // check if package manager is bun
      return "bun";
    } else if (existsSync(path.join(loc, "yarn.lock"))) {
      // check if package manager is yarn
      return "yarn";
    } else {
      // fallback to npm
      return "npm";
    }
  }