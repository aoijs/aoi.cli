import type { Flags } from "../types";

export function extractArgs(args: string[]): Flags {
    const passedArgs = args.slice(2);
    const passedFlags = passedArgs.filter((arg) => arg.startsWith("--")).map((flag) => flag.slice(2));
    const values = passedArgs.filter((arg) => !arg.startsWith("--"));

    const noInputFlags = ["noInstall"];

    const flags = passedFlags.reduce((x, flag, i) => {
        if (noInputFlags.includes(flag)) {
            x[flag] = true;
        } else {
            const xI = i - Object.keys(x).filter((f) => noInputFlags.includes(f)).length;
            x[flag] = values[xI] || null;
        }
        return x;
    }, {} as Flags);

    return flags;
}
