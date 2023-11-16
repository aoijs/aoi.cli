import { exec } from "child_process";
import ora from "ora";

/**
 * Executes a command and ignores its output.
 * @param {string} cmd - The command to execute.
 * @returns {Promise<void>} - A Promise that resolves when the command execution finishes.
 */
export function execute(cmd) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(cmd, { stdio: "ignore" });

    childProcess.on("close", (code) => {
      resolve();
    });
  });
}

/**
 * Installs a package using npm and returns a promise that resolves when the installation is complete.
 * @param {string} pkg - The name of the package to install.
 * @param {string} [text=`Installing ${pkg}`] - The text to display while the package is being installed.
 * @returns {Promise<void>} A promise that resolves when the installation is complete.
 */
export async function install(pkg, text = `Installing \x1b[1m${pkg}\x1b[0m`) {
  const spinner = ora(text).start();

  if (checkNodeJS(process.versions.node, "16.9.0") === -1) {
    spinner.fail(
      `Your Node.js version (${process.versions.node}) is below the recommended version (16.9.0).`
    );
    process.exit();
  }

  return new Promise((resolve) => {
    const installProcess = exec(`npm install ${pkg} --save`, {
      stdio: ["ignore", "pipe", "ignore"],
    });

    installProcess.on("close", (code) => {
      if (code === 0) {
        spinner.succeed(`Installed \x1b[1m${pkg}\x1b[0m`);
      } else {
        spinner.fail(`Failed to install ${pkg}`);
      }
      resolve();
    });
  });
}

/**
 * Compares two Node.js version strings.
 * @param {string} a - The first Node.js version string to compare.
 * @param {string} b - The second Node.js version string to compare.
 * @returns {number}
 */
function checkNodeJS(a, b) {
  const userNodeVersion = a.split(".").map(Number);
  const recommendedNodeVersion = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (userNodeVersion[i] > recommendedNodeVersion[i]) return 1;
    if (recommendedNodeVersion[i] > userNodeVersion[i]) return -1;
    if (isNaN(versionsA[i]) && !isNaN(recommendedNodeVersion[i])) return -1;
    if (!isNaN(versionsA[i]) && isNaN(recommendedNodeVersion[i])) return 1;
  }

  return 0;
}
