import { checkPackageManagerType } from './utils/packageManager.js';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, mkdir, writeFileSync } from 'node:fs';
import { execa } from 'execa';
import chalk from 'chalk';
import crypto from 'crypto';
import ora from 'ora';
import * as path from 'node:path';
const args = process.argv.slice(2);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argsSet = new Set(process.argv.slice(2));
const musicTemplate = argsSet.has('--music');
const panelTemplate = argsSet.has('--panel');
const inviteTemplate = argsSet.has('--invite');
const shardingTemplate = argsSet.has('--sharding');
const preventInstall = argsSet.has('--no-install');
/*

    --music - Include @akarui/aoi.music in the template
    --panel - Include @akarui/aoi.panel in the template
    --invite - Include @akarui/aoi.invite in the template
    --sharding - Include sharding template
    --no-install - Skip installing dependencies

    -- I thought about using enquirer but as it turns out it raises the node version requirement to around 18 and that conflicts with aoi.js. Also enquirer completely sucks on mobile devices, impossible to use, args are way more convenient. Issue is the command gets incredibly long but it's still better than enquirer.

*/
let spinner;
const location = path.join(process.cwd(), args.indexOf('--dir') === -1 ? './aoijs' : args[args.indexOf('--dir') + 1]);
const packageManager = checkPackageManagerType(location);
async function generateTemplate(loc) {
    spinner.stop().clear();
    spinner = ora('Checking if directory exists..').start();
    spinner.stop().clear();
    console.log(chalk.green(`\r\nCreating template in "${loc}" \r\n`));
    if (!existsSync(loc)) {
        const spinner = ora(`Directory doesn't exist, creating..`).start();
        try {
            await new Promise((resolve, reject) => {
                mkdir(loc, { recursive: true }, (err) => {
                    if (err) {
                        console.error(chalk.red('\n\rFailed to create directory inside: ' + loc));
                        reject(err);
                    }
                    else {
                        spinner.stop().clear();
                        mkdir(path.join(loc, './commands'), { recursive: true }, (err) => { });
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            console.error('\n\rFailed to create directory inside: ' + chalk.cyan(location));
            process.exit(1);
        }
    }
    spinner.stop().clear();
    spinner = ora('Generating template...').start();
    const setup = [];
    let _default = readFileSync(path.join(__dirname, '../templates/index.template'), 'utf-8');
    _default = _default.replace('{securityKey}', crypto.randomBytes(16).toString('hex')).replace('{authKey}', crypto.randomBytes(16).toString('hex'));
    //remove first line and split setup
    //@ts-ignore
    _default = _default.split('---').slice(1);
    //put the setup together based on input
    setup.push(_default[0]);
    if (musicTemplate)
        setup.push(_default[1]);
    if (panelTemplate)
        setup.push(_default[2]);
    if (inviteTemplate)
        setup.push(_default[3]);
    setup.push(_default[4].replace('{intents}', musicTemplate
        ? `"MessageContent", "Guilds", "GuildMessages", "GuildVoiceStates"`
        : inviteTemplate
            ? `"MessageContent", "Guilds", "GuildMessages", "GuildInvites"`
            : `"MessageContent", "Guilds", "GuildMessages"`));
    if (musicTemplate)
        setup.push(_default[5]);
    if (panelTemplate)
        setup.push(_default[6]);
    if (inviteTemplate)
        setup.push(_default[7]);
    setup.push(_default[8]);
    spinner.stop().clear();
    if (musicTemplate || panelTemplate || inviteTemplate) {
        console.log(chalk.green(`Including ${[musicTemplate && '@akarui/aoi.music', panelTemplate && '@akarui/aoi.panel', inviteTemplate && '@akarui/aoi.invite'].filter(Boolean).join(', ')} in the template.\r\n`));
    }
    spinner = ora('Creating template...').start();
    if (shardingTemplate) {
        writeFileSync(path.join(location, './sharding.js'), readFileSync(path.join(__dirname, '../templates/sharding.template'), 'utf-8'));
        spinner.stop().clear();
        console.log(chalk.green('\r\nCreated sharding template.\r\n'));
        spinner = ora('Creating template...').start();
    }
    //@ts-ignore
    writeFileSync(path.join(location, './index.js'), setup.join(''));
    writeFileSync(path.join(location, './commands/ping.js'), readFileSync(path.join(__dirname, '../templates/aoi.js/commands/ping.template'), 'utf-8'));
    spinner.stop().clear();
    console.log(chalk.green('Created directory and template files.'));
}
console.log(`${chalk.bgYellow(' note ')}
This command will create a template for you to start creating your aoi.js bot.

${chalk.bgCyan(' create ')}`);
spinner = ora('Creating template...').start();
await generateTemplate(location);
console.log(`\n\r${chalk.bgCyan(' install ')}\n`);
spinner = ora('Installing dependencies...').start();
if (!preventInstall) {
    try {
        spinner.stop().clear();
        if (!existsSync(path.join(location, 'package.json'))) {
            spinner = ora(`Creating package.json using ${chalk.cyan(packageManager)}...`).start();
            await execa(packageManager, packageManager === 'pnpm' ? ['init'] : ['init', '-y'], { cwd: location });
            spinner.stop().clear();
        }
        spinner = ora('Installing dependencies...').start();
        await execa(packageManager, ['install', 'aoi.js'], { cwd: location });
        spinner.succeed('Installed aoi.js.');
        spinner = ora('Installing dependencies...').start();
        if (panelTemplate) {
            await execa(packageManager, ['install', '@akarui/aoi.panel'], { cwd: location });
            spinner.succeed('Installed @akarui/aoi.panel.');
            spinner = ora('Installing dependencies...').start();
        }
        if (inviteTemplate) {
            await execa(packageManager, ['install', '@akarui/aoi.invite'], { cwd: location });
            spinner.succeed('Installed @akarui/aoi.invite.');
            spinner = ora('Installing dependencies...').start();
        }
        if (musicTemplate) {
            await execa(packageManager, ['install', '@akarui/aoi.music'], { cwd: location });
            spinner.succeed('Installed @akarui/aoi.music.');
            spinner = ora('Installing dependencies for @akarui/aoi.music...').start();
            await execa(packageManager, ['install', 'ffmpeg-static', 'opusscript'], { cwd: location });
        }
        spinner.succeed(chalk.green('\n\rInstalled all dependencies.'));
    }
    catch (error) {
        spinner.fail(chalk.red('\n\rFailed to install dependencies using ' + chalk.cyan(packageManager)));
        console.log(error);
        process.exit(1);
    }
}
else {
    spinner.stop().clear();
    console.log(chalk.gray('\n\rUsed --no-install flag, skipping installing dependencies.'));
    console.log(chalk.yellow('Skipped installing dependencies.'));
}
console.log(`
${chalk.bgGreen(' done ')}
You're now ready to go, simply switch to the directory using "${chalk.cyan(`cd ${location}`)}"
and run ${chalk.cyan('node index.js')}

${chalk.gray('Make sure to check our Docs: https://aoi.js.org')}

Happy coding! 🎉`);
//# sourceMappingURL=create.js.map