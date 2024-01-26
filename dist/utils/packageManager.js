import { execa } from "execa";
import { existsSync } from "node:fs";
import chalk from "chalk";
export async function installPackage(packageManager, _package) {
    const command = packageManager === "yarn" ? "add" : "install";
    try {
        await execa(packageManager, [command, _package + "@latest"]);
    }
    catch (error) {
        console.error("• Failed to update " + _package + " using " + chalk.cyan(packageManager));
    }
    finally {
        console.log(`• Successfully updated ${_package} to latest.`);
    }
}
export async function uninstallPackage(packageManager, _package) {
    const command = packageManager === "yarn" ? "remove" : "uninstall";
    try {
        await execa(packageManager, [command, _package]);
    }
    catch (error) {
        console.error("• Failed to uninstall " + _package + " using " + chalk.cyan(packageManager));
    }
}
export function checkPackageManagerType() {
    if (!existsSync(new URL("../../package.json", import.meta.url).pathname.slice(1)))
        return console.error("• No package.json found.");
    if (existsSync(new URL("../../package-lock.json", import.meta.url).pathname.slice(1))) {
        // check if package manager is npm
        return "npm";
    }
    else if (existsSync(new URL("../../pnpm-lock.yaml", import.meta.url).pathname.slice(1))) {
        // check if package manager is pnpm
        return "pnpm";
    }
    else if (existsSync(new URL("../../bun.lockb", import.meta.url).pathname.slice(1))) {
        // check if package manager is bun
        return "bun";
    }
    else if (existsSync(new URL("../../yarn.lock", import.meta.url).pathname.slice(1))) {
        // check if package manager is yarn
        return "yarn";
    }
    else {
        // fallback to npm
        return "npm";
    }
}
