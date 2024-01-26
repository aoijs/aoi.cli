import { installPackage, uninstallPackage, checkPackageManagerType } from "./utils/packageManager.js";
import { readFileSync } from "node:fs";
import chalk from "chalk";
import ora, { Ora } from "ora";

// all @akarui related packages
const packages = [
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
  let dependencies = {};
  for (const dependency of packages) {
    //fetching from npm registry
    const response = await fetch(`https://registry.npmjs.org/${dependency}/latest`);
    const data = await response.json();
    //saving version for later
    dependencies[dependency] = data.version;
  }
  return dependencies;
}

async function getDependencies() {
  const dep = await fetchDependencies();
  const deprecated = [];
  const dependencies = {
    "aoi.js": { npm: dep["aoi.js"], local: "" },
    // @akarui
    "@akarui/aoi.db": { npm: dep["@akarui/aoi.db"], local: "" },
    "@akarui/aoi.music": { npm: dep["@akarui/aoi.music"], local: "" },
    "@akarui/aoi.panel": { npm: dep["@akarui/aoi.panel"], local: "" },
    "@akarui/aoi.parser": { npm: dep["@akarui/aoi.parser"], local: "" },
    "@akarui/aoi.invite": dep["@akarui/aoi.invite"].version,
    // deprecated packages
    "aoi.parser": { npm: dep["@akarui/aoi.parser"], deprecated: true },
    "aoi.db": { npm: dep["@akarui/aoi.db"], deprecated: true },
  };


  for (const dep of packages) {
    // check for all packages
    const deps = readFileSync(new URL("../package.json", import.meta.url).pathname.slice(1),"utf-8");

    if (dependencies[dep]) {
      // set local key to version of installed dep (if exists)
      dependencies[dep].local = JSON.parse(deps).dependencies?.[dep]?.replace("^", "") || "";

      if (dependencies[dep].local.startsWith("github:")) {
        dependencies[dep].local = dependencies[dep].npm;
        dependencies[dep].dev = true;
      }

      // check if package is installed
      if (dependencies[dep].local === "") {
        dependencies[dep].installed = false;
        // delete local key
        delete dependencies[dep].local;
      } else {
        dependencies[dep].installed = true;
      }

      // check if user installed deprecated packages
      if (["aoi.parser", "aoi.db"].includes(dep)) {
        deprecated.push(dep);
      }
    }
  }

  return dependencies;
}


async function packageData() {
  const manager = await checkPackageManagerType();
  const deps = await getDependencies();

  let data = {
    "packageManager": manager,
    "packages": {
        "uninstalled": [],
        "latest": [],
        "deprecated": [],
        "outdated": [],
    }
  }

  // Sort all packages and process them to useable format

  for (const dep of packages) {
    if (deps[dep]?.deprecated && deps[dep].installed === true) {
      // handle deprecated packages
      data.packages.deprecated.push({ package: dep, data: deps[dep] });
    } else if ((deps[dep]?.installed === false || !deps[dep]) && deps[dep]?.deprecated !== true) {
      // handle uninstalled packages
      data.packages.uninstalled.push({ package: dep, data: { installed: false } });
    } else if ((deps[dep]?.npm !== deps[dep]?.local) && deps[dep]?.deprecated !== true) {
      // handle outdated packages
      data.packages.outdated.push({ package: dep, data: deps[dep] });
    } else if ((deps[dep]?.npm === deps[dep]?.local) && deps[dep]?.deprecated !== true) {
      // handle latest packages
      data.packages.latest.push({ package: dep, data: deps[dep] });
    } else {
      // fallback for deprecated packages
      // console.log(dep)
    }

    // remove undefined keys
    data.packages.uninstalled = data.packages.uninstalled.filter((dep) => dep !== undefined);
  }

  return data;
}

async function updatePackages() {
    const data = await packageData();

    spinner.stop().clear()

    for (const [i, dep] of Object.entries(data.packages.latest)) {

      if (dep.data?.dev === true) {
        console.log(`• ${dep.package} using development version.`);
      } else {
        console.log(`• ${dep.package} ${chalk.gray(dep.data.npm)} is up-to-date.`);
      }
    }
    
    // check if anything is deprecated or outdated
    if (data.packages.deprecated.length === 0 && data.packages.outdated.length === 0) {
      console.log(` • No outdated packages found!

${chalk.bgGreen(" install ")}
All packages are up-to-date!

Happy coding! 🎉`)
      return;
    }

    for (const [i, dep] of Object.entries(data.packages.outdated)) {
        // process uninstalled packages
        console.log(`• ${dep.package} ${chalk.gray(dep.data.local)} is outdated, ${chalk.gray(dep.data.npm)} will be installed.`);
    }

    for (const [i, dep] of Object.entries(data.packages.deprecated)) {
        // process uninstalled packages
        console.log(`• ${dep.package} is deprecated, ${chalk.cyan(`@akarui/${dep.package}`)} ${chalk.gray(dep.data.npm)} will be installed instead.`);
    }

    console.log(`
${chalk.bgGreen(" install ")}
Updating now all packages to their latest versions..
    `)

    console.log(`(using ${chalk.cyan(data.packageManager as string)})`)

    for (const [i, dep] of Object.entries(data.packages.outdated)) {
      // process outdated packages
        await installPackage(data.packageManager as string, dep.package);
    }

        for (const [i, dep] of Object.entries(data.packages.deprecated)) {
          // process deprecated packages
            await uninstallPackage(data.packageManager as string, dep.package);
            await installPackage(data.packageManager as string, "@akarui/" + dep.package);
        }
        
        console.log(`
${chalk.bgCyan(" done ")}
All packages are now up-to-date!

Happy coding! 🎉`
        )

}

// main
// todo: fix this console.log misery

console.log(`${chalk.bgYellow(" note ")}
This command will update all @akarui related packages in your project to their latest versions.

${chalk.bgCyan(" check ")}
Now checking for outdated packages..
`);

spinner = ora("Crunching the latest data...").start();

// update all installed akarui packages
await updatePackages();