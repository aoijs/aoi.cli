export declare function installPackage(packageManager: string, _package: string): Promise<void>;
export declare function uninstallPackage(packageManager: string, _package: string): Promise<void>;
export declare function checkPackageManagerType(): void | "yarn" | "npm" | "pnpm" | "bun";
