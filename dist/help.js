import chalk from "chalk";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
dirname(__filename);
const packageJsonPath = new URL('../package.json', import.meta.url);
const { version } = JSON.parse(fs.readFileSync(fileURLToPath(packageJsonPath), 'utf-8'));
console.log(`
${chalk.cyan("@akarui/aoi.cli")} ${chalk.cyan.bold(`v${version}`)}

    ${chalk.cyan(`aoijs ${chalk.bold("[command]")}`)} ${chalk.gray("[...flags]")}

        ${chalk.cyan("aoijs upgrade")}
            ${chalk.gray("Upgrades aoi.js and all related packages to their latest versions.")}

        ${chalk.cyan("aoijs create")}
            ${chalk.gray("Creates a new aoi.js project based on templates.")}
            ${chalk.cyan("Flags:")}
                ${chalk.cyan("--dir [dir]")}
                    ${chalk.gray("Changes the destination directory.")}
                ${chalk.cyan("--music")}
                    ${chalk.gray("Includes @akarui/aoi.music within the template.")}
                ${chalk.cyan("--panel")}
                    ${chalk.gray("Includes @akarui/aoi.panel within the template.")}
                ${chalk.cyan("--invite")}
                    ${chalk.gray("Includes @akarui/aoi.invite within the template.")}
                ${chalk.cyan("--no-install")}
                    ${chalk.gray("Skips installing dependencies. (including init)")}

        ${chalk.cyan("aoijs help")}
            ${chalk.gray("Shows this help message.")}
`);
//# sourceMappingURL=help.js.map