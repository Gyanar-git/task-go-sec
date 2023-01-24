const tasks = require("jfrog-pipelines-tasks");
const path = require("path");


module.exports = { go_sec, run_gosec, install_gosec
};

async function go_sec() {
  try {
    const goPathStdout = (await tasks.execute("go env GOPATH")).stdOut;
    if (goPathStdout) {
      const {goPathBin, staticCheckInstall} = await install_gosec(goPathStdout);
      const {stdOut, stdErr} = (await tasks.execute(`${goPathBin}/gosec -version`))
      tasks.info(`These errors were reported by the command while executing static check but they did NOT cause the command to fail: [${stdErr}]`)
      if (stdOut) {
        await run_gosec(goPathBin);
      }
    } else {
      tasks.warning("Not able to find Go which is mandatory for gosec.Hence couldn’t perform static check analysis, please use setup-go task")
    }
  } catch (e) {
  }
}

async function run_gosec(goPathBin) {
  let sourcePath = tasks.getInput("sourceFilePath");
  if (sourcePath == "") {
    tasks.warning(`Please provide go source path for Static Check Analysis`);
  }
  const {stdOut, stdErr} = ((await tasks.execute(`cd ${sourcePath}`)));
  tasks.info(`These errors were reported by the command but they did NOT cause the command to fail: [${stdErr}]`)
  tasks.info(`The command to completed with stdOut: [${stdOut}]]`);
  tasks.info("Gosec installed successfully")
  const {stdOutStaticCheck, stdErrStaticCheck} = ((await tasks.execute(`${goPathBin}/gosec ./...`)));
  tasks.info(`These errors were reported by the command while executing gosec check but they did NOT cause the command to fail: [${stdErrStaticCheck}]`)
  tasks.info(`The command static check analysis completed with stdOut: [${stdOutStaticCheck}]]`);

}

async function install_gosec(goPath) {
  tasks.info("Go is installed hence proceeding with the static code analysis")
  const goPathBin = path.join(goPath, "bin");
  tasks.appendToPath(goPathBin);
  const {gosecInstallStdOut,gosecInstallStdErr} = ((await tasks.execute(`curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b ${goPathBin}`)));
  tasks.info(`These errors were reported by the command while installing gosec but they did NOT cause the command to fail: [${gosecInstallStdErr}]`)
  return {goPathBin, gosecInstallStdOut};
}

