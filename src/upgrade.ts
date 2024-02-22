import {
  installPackage,
  uninstallPackage,
  checkPackageManagerType,
} from "./utils/packageManager.js";
import { readFileSync } from "node:fs";
import chalk from "chalk";
import ora, { Ora } from "ora";
import path from "path";

interface DependencyDetails {
  npm: string;
  local?: string;
  dev?: boolean;
  deprecated?: boolean;
  installed?: boolean;
}

interface Dependencies {
  [key: string]: DependencyDetails;
  "aoi.js": DependencyDetails;
  "@akarui/aoi.db": DependencyDetails;
  "@akarui/aoi.music": DependencyDetails;
  "@akarui/aoi.panel": DependencyDetails;
  "@akarui/aoi.parser": DependencyDetails;
  "@akarui/aoi.invite": DependencyDetails;
  "aoi.parser": DependencyDetails;
  "aoi.db": DependencyDetails;
}

interface PackageData {
  packageManager: string;
  packages: {
    uninstalled: Array<{ package: string; data: { installed: boolean } }>;
    latest: Array<{ package: string; data: DependencyDetails }>;
    deprecated: Array<{ package: string; data: DependencyDetails }>;
    outdated: Array<{ package: string; data: DependencyDetails }>;
  };
}

// all @akarui related packages
const packages: string[] = [
  "aoi.js",
  "@akarui/aoi.db",
  "@akarui/aoi.music",
  "@akarui/aoi.panel",
  "@akarui/aoi.parser",
  "@akarui/aoi.invite",
  "aoi.parser" /* deprecated */,
  "aoi.db" /* deprecated */,
];

let spinner: Ora;

async function fetchDependencies() {
  let dependencies: Record<string, string> = {};
  for (const dependency of packages) {
    //fetching from npm registry
    const response = await fetch(
      `https://registry.npmjs.org/${dependency}/latest`
    );
    const data = await response.json();
    //saving version for later
    dependencies[dependency] = data.version;
  }
  return dependencies;
}

async function getDependencies(loc: string) {
  const dep = await fetchDependencies();
  const deprecated = [];
  const dependencies: Dependencies = {
    "aoi.js": { npm: dep["aoi.js"], local: "" },
    // @akarui
    "@akarui/aoi.db": { npm: dep["@akarui/aoi.db"], local: "" },
    "@akarui/aoi.music": { npm: dep["@akarui/aoi.music"], local: "" },
    "@akarui/aoi.panel": { npm: dep["@akarui/aoi.panel"], local: "" },
    "@akarui/aoi.parser": { npm: dep["@akarui/aoi.parser"], local: "" },
    "@akarui/aoi.invite": { npm: dep["@akarui/aoi.invite"], local: "" },
    // deprecated packages
    "aoi.parser": { npm: dep["@akarui/aoi.parser"], deprecated: true },
    "aoi.db": { npm: dep["@akarui/aoi.db"], deprecated: true },
  };

  for (const packageName of Object.keys(dependencies)) {
    const packageInfo = dependencies[packageName];
    const deps = readFileSync(path.join(loc, "package.json"), "utf-8");

    if (packageInfo.npm) {
      packageInfo.local = JSON.parse(deps).dependencies?.[packageName]?.replace("^", "") || "";

      //@ts-ignore
      if (packageInfo?.local.startsWith("github:")) {
        packageInfo.local = packageInfo.npm;
        packageInfo.dev = true;
      }

      packageInfo.installed = packageInfo.local !== "";

      if (["aoi.parser", "aoi.db"].includes(packageName)) {
        deprecated.push(packageName);
      }
    }
  }

  return dependencies;
}


async function packageData(loc: string): Promise<PackageData> {
  const manager: string = checkPackageManagerType(loc);
  const deps = await getDependencies(loc);

  let data: PackageData = {
    packageManager: manager,
    packages: {
      uninstalled: [],
      latest: [],
      deprecated: [],
      outdated: [],
    },
  };

  // Sort all packages and process them to useable format

  for (let dep of packages) {
    if (deps[dep]?.deprecated && deps[dep].installed === true) {
      // handle deprecated packages
      data.packages.deprecated.push({ package: dep, data: deps[dep] });
    } else if ((deps[dep]?.installed === false || !deps[dep]) && deps[dep]?.deprecated !== true) {
      // handle uninstalled packages
      data.packages.uninstalled.push({
        package: dep,
        data: { installed: false },
      });
    } else if (deps[dep]?.npm !== deps[dep]?.local && deps[dep]?.deprecated !== true) {
      // handle outdated packages
      data.packages.outdated.push({ package: dep, data: deps[dep] });
    } else if (deps[dep]?.npm === deps[dep]?.local && deps[dep]?.deprecated !== true) {
      // handle latest packages
      data.packages.latest.push({ package: dep, data: deps[dep] });
    } else {
      // fallback for deprecated packages
      // console.log(dep)
    }

    // remove undefined keys
    data.packages.uninstalled = data.packages.uninstalled.filter(
      (dep: { package: string; data: { installed: boolean } }) => dep !== undefined
    );
  }

  return data;
}

async function updatePackages(loc: string): Promise<void> {
  const data = await packageData(loc) as PackageData;

  spinner.stop().clear();

  for (const [i, dep] of Object.entries(data.packages.latest)) {
    if (dep.data?.dev === true) {
      console.log(`• ${dep.package} using development version.`);
    } else {
      console.log(
        `• ${dep.package} ${chalk.gray(dep.data.npm)} is up-to-date.`
      );
    }
  }

  // check if anything is deprecated or outdated
  if (
    data.packages.deprecated.length === 0 &&
    data.packages.outdated.length === 0
  ) {
    console.log(`
• No outdated packages found! 🚀

${chalk.bgGreen(" install ")}
All packages are up-to-date!

Happy coding! 🎉`);
    return;
  }

  for (const [i, outdatedPackage] of Object.entries(data.packages.outdated)) {
    const { package: packageName, data: packageData } = outdatedPackage;
    const localVersion = packageData.local || ""; 
    const npmVersion = packageData.npm || "";
    console.log(
        `• ${packageName} ${chalk.gray(localVersion)} is outdated, ${chalk.gray(
            npmVersion
        )} will be installed.`
    );
}

  for (const [i, deprecatedPackage] of Object.entries(data.packages.deprecated)) {
      const { package: packageName, data: packageData } = deprecatedPackage;
      console.log(
          `• ${packageName} is deprecated, ${chalk.cyan(
              `@akarui/${packageName}`
          )} ${chalk.gray(packageData.npm)} will be installed instead.`
      );
  }

  console.log(`
${chalk.bgGreen(" install ")}
Updating now all packages to their latest versions..
    `);

  console.log(`(using ${chalk.cyan(data.packageManager)})`);

  for (const outdatedPackage of data.packages.outdated) {
      const packageName = outdatedPackage.package;
      await installPackage(data.packageManager, packageName);
  }
  
  for (const deprecatedPackage of data.packages.deprecated) {
      const packageName = deprecatedPackage.package;
      await uninstallPackage(data.packageManager, packageName);
      await installPackage(data.packageManager, "@akarui/" + packageName);
  }
  

  console.log(`
${chalk.bgCyan(" done ")}
All packages are now up-to-date!

Happy coding! 🎉`);
}

// main
// todo: fix this console.log misery

export async function upgrade(loc: string) {
  console.log(`${chalk.bgYellow(" note ")}
This command will update all @akarui related packages in your project to their latest versions.

${chalk.bgCyan(" check ")}
Now checking for outdated packages..
`);

  spinner = ora("Crunching the latest data...").start();

  // update all installed akarui packages
  await updatePackages(loc);
}