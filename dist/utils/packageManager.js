import { execa } from 'execa';
import { existsSync, mkdirSync } from 'node:fs';
import chalk from 'chalk';
import path from 'path';
import ora from 'ora';
import fsExtra from 'fs-extra';
let spinner;
export async function installPackage(packageManager, _package, loc) {
    const command = packageManager === 'yarn' ? 'add' : 'install';
    try {
        spinner = ora(`Upgrading ${chalk.cyan(_package)}`).start();
        await execa(packageManager, [command, _package + '@latest']);
    }
    catch (error) {
        spinner.fail('Failed to update ' + chalk.cyan(_package) + ' using ' + chalk.cyan(packageManager));
        console.error(`If you are using ${packageManager}, try running: ${chalk.cyan(`${packageManager} ${command} ${_package}@latest`)} manually.`);
        spinner = ora(`Starting recovery`).start();
        spinner.text = 'Trying to recover';
        spinner.text = 'Moving node_modules to .temp';
        let lockFile;
        switch (packageManager) {
            case 'npm':
                lockFile = 'package-lock.json';
                break;
            case 'pnpm':
                lockFile = 'pnpm-lock.yaml';
                break;
            case 'bun':
                lockFile = 'bun.lockb';
                break;
            case 'yarn':
                lockFile = 'yarn.lock';
                break;
            default:
                lockFile = 'package-lock.json';
        }
        if (!existsSync(path.join(loc, lockFile)) || !existsSync(path.join(loc, 'node_modules'))) {
            spinner.fail('Failed to recover, missing lock file or node_modules.');
            console.log(`Please try to manually run: ${chalk.cyan(`${packageManager} ${command} ${_package}@latest`)}`);
            process.exit(1);
        }
        if (!existsSync('.temp')) {
            mkdirSync('.temp');
        }
        await fsExtra.move(path.join(loc, 'node_modules'), path.join(loc, '.temp', 'node_modules'));
        await fsExtra.move(path.join(loc, lockFile), path.join(loc, '.temp', lockFile));
        spinner.text = 'Reinstalling all packages...';
        try {
            await execa(packageManager, [command]);
        }
        catch (reinstallError) {
            spinner.fail('Attempt to recover failed, restoring files.');
            await fsExtra.move(path.join(loc, '.temp', 'node_modules'), path.join(loc, 'node_modules'));
            await fsExtra.move(path.join(loc, '.temp', lockFile), path.join(loc, lockFile));
            if (existsSync(path.join(loc, '.temp'))) {
                await fsExtra.remove('.temp');
            }
            process.exit(1);
        }
    }
    finally {
        spinner.succeed(`Successfully updated ${_package} to latest.`);
    }
}
export async function uninstallPackage(packageManager, _package) {
    const command = packageManager === 'yarn' ? 'remove' : 'uninstall';
    try {
        await execa(packageManager, [command, _package]);
    }
    catch (error) {
        console.error('• Failed to uninstall ' + _package + ' using ' + chalk.cyan(packageManager));
    }
}
export function checkPackageManagerType(loc) {
    if (!existsSync(path.join(loc, 'package.json'))) {
        // Fallback to npm when no package.json
        return 'npm';
    }
    if (existsSync(path.join(loc, 'package-lock.json'))) {
        // check if package manager is npm
        return 'npm';
    }
    else if (existsSync(path.join(loc, 'pnpm-lock.yaml'))) {
        // check if package manager is pnpm
        return 'pnpm';
    }
    else if (existsSync(path.join(loc, 'bun.lockb'))) {
        // check if package manager is bun
        return 'bun';
    }
    else if (existsSync(path.join(loc, 'yarn.lock'))) {
        // check if package manager is yarn
        return 'yarn';
    }
    else {
        // fallback to npm
        return 'npm';
    }
}
//# sourceMappingURL=packageManager.js.map