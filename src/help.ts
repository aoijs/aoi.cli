import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'node:fs';
import { findBestMatch } from 'string-similarity';

export async function help(command: string | undefined) {
    const latest: string = await fetchVersion();
    const __filename: string = fileURLToPath(import.meta.url);
    dirname(__filename);

    const packageJsonPath: URL = new URL('../package.json', import.meta.url);
    const { version }: { version: string } = JSON.parse(readFileSync(fileURLToPath(packageJsonPath), 'utf-8'));

    if (!command || command === 'help') {
        console.log(`
${chalk.cyan('@akarui/aoi.cli')} ${chalk.cyan.bold(`v${version}`)} ${version !== latest ? chalk.gray(`(a newer version (v${latest}) is available)`) : ''}

    ${chalk.cyan(`aoijs ${chalk.bold('[command]')}`)} ${chalk.gray('[...flags]')}

        ${chalk.cyan('aoijs upgrade')}
            ${chalk.gray('Upgrades aoi.js and all related packages to their latest versions.')}

        ${chalk.cyan('aoijs create')}
            ${chalk.gray('Creates a new aoi.js project based on templates.')}
            ${chalk.cyan('Flags:')}
                ${chalk.cyan('--dir [dir]')}
                    ${chalk.gray('Changes the destination directory.')}
                ${chalk.cyan('--music')}
                    ${chalk.gray('Includes @akarui/aoi.music within the template.')}
                ${chalk.cyan('--panel')}
                    ${chalk.gray('Includes @akarui/aoi.panel within the template.')}
                ${chalk.cyan('--invite')}
                    ${chalk.gray('Includes @akarui/aoi.invite within the template.')}
                ${chalk.cyan('--no-install')}
                    ${chalk.gray('Skips installing dependencies. (including init)')}

        ${chalk.cyan('aoijs help')}
            ${chalk.gray('Shows this help message.')}
`);
    } else {
        const commands = ['upgrade', 'help', 'create'];
        const matches = findBestMatch(command, commands);
        if (matches.bestMatch.rating > 0.1) {
            console.log(`
${chalk.cyan('@akarui/aoi.cli')} ${chalk.cyan.bold(`v${version}`)} ${version !== latest ? chalk.gray(`(a newer version (v${latest}) is available)`) : ''}

Invalid command "${command}". Did you mean "${matches.bestMatch.target}"?

For a full list of flags & commands, run ${chalk.cyan('aoijs help')}.

    ${chalk.cyan(`aoijs ${chalk.bold('[command]')}`)} ${chalk.gray('[...flags]')}

        ${chalk.cyan('aoijs upgrade')}
            ${chalk.gray('Upgrades aoi.js and all related packages to their latest versions.')}

        ${chalk.cyan('aoijs create')}
            ${chalk.gray('Creates a new aoi.js project based on templates.')}

        ${chalk.cyan('aoijs help')}
            ${chalk.gray('Shows this help message.')}
`);
            process.exit(1);
        } else {
            console.log(`
${chalk.cyan('@akarui/aoi.cli')} ${chalk.cyan.bold(`v${version}`)} ${version !== latest ? chalk.gray(`(a newer version (v${latest}) is available)`) : ''}

Invalid command "${command}".

For a full list of flags & commands, run ${chalk.cyan('aoijs help')}.

    ${chalk.cyan(`aoijs ${chalk.bold('[command]')}`)} ${chalk.gray('[...flags]')}

        ${chalk.cyan('aoijs upgrade')}
            ${chalk.gray('Upgrades aoi.js and all related packages to their latest versions.')}

        ${chalk.cyan('aoijs create')}
            ${chalk.gray('Creates a new aoi.js project based on templates.')}

        ${chalk.cyan('aoijs help')}
            ${chalk.gray('Shows this help message.')}
`);
        }
    }
}

async function fetchVersion() {
    //fetching from npm registry
    const response = await fetch(`https://registry.npmjs.org/@akarui/aoi.cli/latest`);
    const data = await response.json();
    //saving version for later
    return data.version;
}
