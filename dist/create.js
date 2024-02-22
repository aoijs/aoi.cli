import { checkPackageManagerType } from "./utils/packageManager.js";
import { fileURLToPath } from "url";
import { existsSync, readFileSync, mkdir, writeFileSync } from "node:fs";
import { wait } from "./utils/functions.js";
import { execa } from "execa";
import chalk from "chalk";
import crypto from "crypto";
import ora from "ora";
import * as path from "node:path";
const args = process.argv.slice(2);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const includeMusic = args.includes("--music");
const includePanel = args.includes("--panel");
const includeInvite = args.includes("--invite");
const useSharding = args.includes("--sharding");
const noInstall = args.includes("--no-install");
let spinner;
const location = path.join(__dirname, "..", args.indexOf("--dir") === -1 ? "./aoijs" : args[args.indexOf("--dir") + 1]);
const packageManager = checkPackageManagerType(location);
await wait(2000);
async function generateTemplate(loc) {
    spinner.stop().clear();
    spinner = ora("Checking if directory exists..").start();
    await wait(2000);
    if (!existsSync(loc)) {
        const spinner = ora(`Directory doesn't exist, creating..`).start();
        try {
            await new Promise((resolve, reject) => {
                mkdir(loc, { recursive: true }, (err) => {
                    if (err) {
                        spinner.stop().clear();
                        console.error("\n\r• Failed to create directory inside: " + chalk.cyan(location));
                        reject(err);
                    }
                    else {
                        spinner.stop().clear();
                        console.log("• Created directory.");
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            console.error("\n\r• Failed to create directory inside: " + chalk.cyan(location));
            process.exit(1);
        }
    }
    spinner.stop().clear();
    spinner = ora("Generating template...").start();
    await wait(2500);
    const setup = [];
    let _default = readFileSync(path.join(__dirname, "../templates/index.template"), "utf-8");
    _default = _default.replace("{securityKey}", crypto.randomBytes(16).toString("hex")).replace("{authKey}", crypto.randomBytes(16).toString("hex"));
    //remove first line and split setup
    //@ts-ignore
    _default = _default.split("---").slice(1);
    //put the setup together based on input
    setup.push(_default[0]);
    if (includeMusic)
        setup.push(_default[1]);
    if (includePanel)
        setup.push(_default[2]);
    if (includeInvite)
        setup.push(_default[3]);
    setup.push(_default[4].replace("{intents}", includeMusic ? `"MessageContent", "Guilds", "GuildMessages", "GuildVoiceStates"` : includeInvite ? `"MessageContent", "Guilds", "GuildMessages", "GuildInvites"` : `"MessageContent", "Guilds", "GuildMessages"`));
    if (includeMusic)
        setup.push(_default[5]);
    if (includePanel)
        setup.push(_default[6]);
    if (includeInvite)
        setup.push(_default[7]);
    setup.push(_default[8]);
    spinner.stop().clear();
    console.log(`• Extensions: ${includeMusic ? chalk.green("@akarui/aoi.music") : chalk.red("@akarui/aoi.music")}, ${includePanel ? chalk.green("@akarui/aoi.panel") : chalk.red("@akarui/aoi.panel")}, ${includeInvite ? chalk.green("@akarui/aoi.invite") : chalk.red("@akarui/aoi.invite")}`);
    spinner = ora("Creating template...").start();
    await wait(2000);
    if (useSharding) {
        //@ts-ignore
        writeFileSync(path.join(location, "./sharding.js"), readFileSync(path.join(__dirname, "../templates/sharding.template"), "utf-8"));
        spinner.stop().clear();
        console.log("• Created sharding template.");
        spinner = ora("Creating template...").start();
        await wait(2000);
    }
    //@ts-ignore
    writeFileSync(path.join(location, "./index.js"), setup.join(""));
    spinner.stop().clear();
    console.log("• Created template.");
}
console.log(`${chalk.bgYellow(" note ")}
This command will create a template for you to start your bot.

${chalk.bgCyan(" create ")}`);
spinner = ora("Creating template...").start();
await generateTemplate(location);
console.log(`
${chalk.bgCyan(" install ")}`);
spinner = ora("Installing dependencies...").start();
if (!noInstall) {
    try {
        spinner.stop().clear();
        if (!existsSync(path.join(location, "package.json"))) {
            spinner = ora(`Creating package.json using ${chalk.cyan(packageManager)}...`).start();
            await execa(packageManager, packageManager === "pnpm" ? ["init"] : ["init", "-y"], { cwd: location });
            await wait(2000);
            spinner.stop().clear();
        }
        spinner = ora("Installing dependencies...").start();
        await execa(packageManager, ["install", "aoi.js"], { cwd: location });
        spinner.stop().clear();
        console.log("• Installed aoi.js.");
        spinner = ora("Installing dependencies...").start();
        if (includePanel) {
            await execa(packageManager, ["install", "@akarui/aoi.panel"], { cwd: location });
            spinner.stop().clear();
            console.log("• Installed @akarui/aoi.panel.");
            spinner = ora("Installing dependencies...").start();
        }
        if (includeInvite) {
            await execa(packageManager, ["install", "@akarui/aoi.invite"], { cwd: location });
            spinner.stop().clear();
            console.log("• Installed @akarui/aoi.invite.");
            spinner = ora("Installing dependencies...").start();
        }
        if (includeMusic) {
            await execa(packageManager, ["install", "@akarui/aoi.music"], { cwd: location });
            spinner.stop().clear();
            console.log("• Installed @akarui/aoi.music.");
            spinner = ora("Installing dependencies for @akarui/aoi.music...").start();
            await execa(packageManager, ["install", "ffmpeg-static", "opusscript"], { cwd: location });
        }
        spinner.stop().clear();
        console.log("• Installed dependencies.");
    }
    catch (error) {
        console.error("\n\r• Failed to install dependencies using " + chalk.cyan(packageManager));
        console.log(error);
        process.exit(1);
    }
}
else {
    spinner.stop().clear();
    console.log(chalk.gray("Used --no-install flag, skipping installing dependencies."));
    console.log("• Skipped installing dependencies.");
}
console.log(`
${chalk.bgGreen(" done ")}
You're now ready to go, simply switch to the directory and run ${chalk.cyan("node index.js")}

Happy coding! 🎉`);
//# sourceMappingURL=create.js.map