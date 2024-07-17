import { type PathLike } from 'node:fs';

export type Flags = {
    dir: string | null | PathLike; 
    noInstall: null | boolean;
    packageManager: "npm" | "yarn" | "pnpm";
}