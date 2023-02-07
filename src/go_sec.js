const tasks = require("jfrog-pipelines-tasks");
const path = require("path");


module.exports = {goSec, logErrorAndExit};

/**
 *
 * @returns {Promise<never>}
 */
async function goSec() {
  try {
    const {stdOut: goPathStdOut, stdErr: goPathStdErr} = (await tasks.execute("go env GOPATH"));
    if (goPathStdOut) {
      const {goPathBin} = await installGoSec(goPathStdOut);
      const {stdOut: goSecVersionStdOut, stdErr: goSecVersionStErr} = (await tasks.execute(`${goPathBin}/gosec -version`));
      if (goSecVersionStdOut) {
        tasks.info(`Checking the Go Sec version: [${goSecVersionStdOut.toString()}]`);
        await resolveSourceDir(goPathBin);
      } else {
        tasks.error(`Command for checking the Go Sec version failed with error: [${goSecVersionStErr}]`);
        process.exit(1)
      }
    } else {
      tasks.error(`Not able to find Go which is mandatory for go sec with error: ${goPathStdErr}.Hence could not perform Go sec, please use setup-go task`);
      process.exit(1)
    }
  } catch (e) {
    logErrorAndExit(e)
  }
}

/**
 * Resolves the source path
 * @param sourcePath - path where static check to be run
 * @returns {string}
 */
function resolveSourcePath() {
  const resourceName = tasks.getInput('resourceName');
  const sourcePath = tasks.getInput('sourcePath');
  if (resourceName === '') {
    throw new Error('One of mandatory input[resourceName] is missing. Please verify Static Check task inputs.');
  }
  const resource = tasks.getResource(resourceName)
  tasks.info("Resurce name:" +resource)
  tasks.info("Resurce path:" +resource.resourcePath)
  const op = tasks.getVariable(`res_${resource.resourceName}_resourcePath`)
  tasks.info("opppppp:" +op)
  if(sourcePath === ''){
    return resource.resourcePath ;
  } else {
    return path.resolve(resource.resourcePath, sourcePath);
  }
}

/**
 * Get the supported options
 * @returns {{options: *[]}}
 */
function getOptions() {
  let options = [];
  let includeRules = tasks.getInput("includeRules");
  if (includeRules) {
    options.push('-include ' + includeRules)
  }

  let excludeRules = tasks.getInput("excludeRules")
  if (excludeRules) {
    options.push('-exclude ' + excludeRules)
  }

  let commandArgs = tasks.getInput("commandArgs");
  if (commandArgs) {
    options.push(commandArgs)
  }

  let outputFormat = tasks.getInput("outputFormat");
  if (excludeRules) {
    options.push('--fmt ' + outputFormat)
  }

  return {options};
}

/**
 *
 * @param options
 * @param goPathBin
 * @returns {Promise<void>}
 */
async function runGoSec(options, goPathBin, resolvedPath) {
  const {
    stdOut: stdOutGoSec, stdErr: stdErrGoSec
  } = options ? ((await tasks.execute(`cd ${resolvedPath} && ${goPathBin}/gosec ${options}./...`))) : ((await tasks.execute(`cd ${resolvedPath} && ${goPathBin}/gosec ./...`)));
  if (stdOutGoSec) {
    tasks.info(`Ran go sec with output: [${stdOutGoSec}]]`);
  } else {
    tasks.error(`Error running go sec: [${stdErrGoSec}]`);
    process.exit(1);
  }
}

/**
 *
 * @param goPathBin - path where got is installed
 * @returns {Promise<never>}
 */
async function resolveSourceDir(goPathBin) {
  let options = getOptions();
  let resolvedPath = resolveSourcePath();
  await runGoSec(options, goPathBin,resolvedPath);
}

/**
 * This function is for installing go sec
 * @param goPath - - path where got is installed
 * @returns {Promise<{goPathBin: string}>}
 */
async function installGoSec(goPath) {
  let goSecVersion = tasks.getInput("goSecVersion");
  if (!goSecVersion) {
    goSecVersion = "latest";
  }
  tasks.info("Go is installed hence installing go sec from [ithub.com/securego/gosec/v2/cmd/gosec]");
  const goPathBin = path.join(goPath, "bin");
  tasks.appendToPath(goPathBin);
  tasks.info("goPathBin: " + goPathBin);
  try {
    const {
      stdOut: stdOutInstall, stdErr: stdErrInstall
    } = (await tasks.execute(`go install github.com/securego/gosec/v2/cmd/gosec@${goSecVersion} 2>/dev/null`));
    if (stdErrInstall) {
      tasks.error(`Failed to install Go Sec with error:[${stdErrInstall}] `);
    } else {
      tasks.info("Successfully Installed Go Sec");
    }
  } catch (e) {
    logErrorAndExit(e)
  }
  return {goPathBin};
}

/**
 *
 * @param error
 */
function logErrorAndExit(error) {
  tasks.error(error);
  tasks.debug(error.stack);
  process.exit(1);
}