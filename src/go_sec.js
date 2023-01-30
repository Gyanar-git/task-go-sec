const tasks = require("jfrog-pipelines-tasks");
const path = require("path");


module.exports = { goSec } ;

async function goSec() {
  try {
    const goPathStdout = (await tasks.execute("go env GOPATH")).stdOut;
    if (goPathStdout) {
      const {goPathBin, goSecInstall} = await installGoSec(goPathStdout);
      //tasks.info(`Go installed without any error: [${goSecInstall}]`);
      const {stdOut, stdErr} = (await tasks.execute(`${goPathBin}/gosec -version`));
      if (stdOut) {
        tasks.info(`Checking the gosec version: [${stdOut}]`);
        await runGoSec(goPathBin);
      } else {
        tasks.error(`Command for checking the gosec verion failed with error: [${stdErr}]`);
        return process.exit(1);
      }
    } else {
      tasks.error("Not able to find Go which is mandatory for go sec.Hence could not perform Go sec, please use setup-go task");
      return process.exit(1);
    }
  } catch (e) {
    tasks.error(`${e}`);
    return process.exit(1);
  }
}

function resolveSourcePath(sourcePath) {
  if (!sourcePath) {
    tasks.info("sourcePath not defined hence setting input to current working directory");
    return tasks.getWorkingDir();
  } else {
    tasks.info("Found the source path to scan for");
    return path.resolve(tasks.getWorkingDir(), sourcePath);
  }
}

async function runGoSec(goPathBin) {
  let sourcePath = tasks.getInput("sourcePath");
  let excludeRules = tasks.getInput("excludeRules");
  tasks.info("Excluded rules:-" +excludeRules);
  let resolvedPath = resolveSourcePath(sourcePath);
  const stdErr = ((await tasks.execute(`cd ${resolvedPath}`)));
  if (stdErr) {
    tasks.error(`Unable to switch to the source repo for running go sec with error: [${stdErr}]`);
    return process.exit(1);
  } else {
    tasks.info(`Switching to the source repo for running go sec`);
  }
  tasks.info("Checking if the gosec binary present")
  tasks.execute(`ls -lrt`)
  const {stdOutStaticCheck, stdErrStaticCheck} = ((await tasks.execute(`${goPathBin}/gosec -exclude=${excludeRules} -tests -exclude-dir=\\.*test\\.* ./...`)));
  if (stdOutStaticCheck) {
    tasks.info(`Ran go sec with output: [${stdOutStaticCheck}]]`);
  } else {
    tasks.error(`Error running go sec: [${stdErrStaticCheck}]`);
    return process.exit(1);
  }
}

async function installGoSec(goPath) {
  tasks.info("Go is installed hence installing go sec" +goPath);
  const goPathBin = path.join(goPath, "bin");
  tasks.appendToPath(goPathBin);
  tasks.info("goPathBin: " +goPathBin);
  //tasks.execute(`cd ${goPathBin} `)
  const {stdOut,stdErr} = ((await tasks.execute(`curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b ${goPathBin}`)));
  tasks.execute(`ls -lrt `)
  if (stdOut) {
    tasks.info("Installed go sec");
  } else {
    tasks.execute(`ls -lrt `)
    //tasks.error(`Unable to install go sec with error: [${stdErr}]`);
    //return process.exit(1);
  }
  return {goPathBin, stdOut};
}

