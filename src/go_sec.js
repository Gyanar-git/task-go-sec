const tasks = require("jfrog-pipelines-tasks");
const path = require("path");


module.exports = { goSec } ;

async function goSec() {
  try {
    const goPathStdout = (await tasks.execute("go env GOPATH")).stdOut;
    if (goPathStdout) {
      const {goPathBin, staticCheckInstall} = await installGoSec(goPathStdout);
      tasks.info(`These errors were reported by the command while installing gosec but they did NOT cause the command to fail: [${staticCheckInstall}]`)
      const {stdOut, stdErr} = (await tasks.execute(`${goPathBin}/gosec -version`))
      tasks.info(`These errors were reported by the command while executing static check but they did NOT cause the command to fail: [${stdErr}]`)
      if (stdOut) {
        await runGoSec(goPathBin);
      }
    } else {
      tasks.warning("Not able to find Go which is mandatory for gosec.Hence couldn’t perform static check analysis, please use setup-go task")
    }
  } catch (e) {
    tasks.error(`${e}`);
    return process.exit(1);
  }
}

function resolveSourcePath(sourcePath) {
  let resolvedPath;
  if (!sourcePath) {
    tasks.info("sourcePath not defined hence setting iut to current working directory" + resolvedPath)
    return tasks.getWorkingDir();
  } else {
    tasks.info("Found the source path to scan for")
    return path.resolve(tasks.getWorkingDir(), sourcePath);
  }
}

async function runGoSec(goPathBin) {
  let sourcePath = tasks.getInput("sourcePath");
  let resolvedPath = resolveSourcePath(sourcePath);
  tasks.warning(`Please provide go source path for gosec to run`);
  const {stdOut, stdErr} = ((await tasks.execute(`cd ${resolvedPath}`)));
  tasks.info(`These errors were reported by the command but they did NOT cause the command to fail: [${stdErr}]`)
  tasks.info(`The command to completed with stdOut: [${stdOut}]]`);
  const {stdOutStaticCheck, stdErrStaticCheck} = ((await tasks.execute(`${goPathBin}/gosec ./...`)));
  tasks.info(`These errors were reported by the command while executing gosec check but they did NOT cause the command to fail: [${stdErrStaticCheck}]`)
  tasks.info(`The command static check analysis completed with stdOut: [${stdOutStaticCheck}]]`);

}

async function installGoSec(goPath) {
  tasks.info("Go is installed hence proceeding with the static code analysis")
  const goPathBin = path.join(goPath, "bin");
  tasks.appendToPath(goPathBin);
  const {gosecInstallStdOut,gosecInstallStdErr} = ((await tasks.execute(`curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b ${goPathBin}`)));
  tasks.info(`These errors were reported by the command while installing gosec but they did NOT cause the command to fail: [${gosecInstallStdErr}]`)
  return {goPathBin, gosecInstallStdOut};
}

