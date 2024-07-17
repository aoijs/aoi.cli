import prompts from "prompts";
import { existsSync } from "node:fs";
import { join } from "node:path";
export async function askToken() {
    const prompt = await prompts({
        type: "text",
        name: "value",
        message: "Enter your Discord Bot Token",
        initial: "Skip this for now",
        validate: (v) => (v.length < 17 ? `You must provide a token` : true)
    });
    const token = prompt.value;
    switch (token) {
        case "Skip this for now":
            return null;
        default:
            return token;
    }
}
export async function askDirectory(directory) {
    const prompt = await prompts({
        type: "text",
        name: "value",
        message: "Where would you like to create the project?",
        initial: "./aoijs",
        validate: (v) => (existsSync(v) ? `Directory already exists, choose another one` : true)
    });
    const validDirectory = directory?.toString() ? directory.toString() : process.cwd();
    const relativeDirectory = join(validDirectory, prompt.value);
    return relativeDirectory;
}
