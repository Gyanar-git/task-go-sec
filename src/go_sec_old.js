const tasks = require("jfrog-pipelines-tasks");
const path = require("path");

async function go_sec() {
  tasks.info("Checking if go installed for running GO Sec")
  const goPath = (await tasks.execute("go env GOPATH")).stdOut;
  try {
    if (goPath) {
      tasks.info("Go is installed hence proceeding with the GO Sec")
      const goPathBin = path.join(goPath, "bin");
      tasks.appendToPath(goPathBin);
      tasks.info("Installing the GO Sec")
      //const path = tasks.execute("go env GOPATH")
      tasks.info("GO pathhhhh:" + goPath)
      tasks.info("GO pathhhhh biinnnnn:" + goPathBin)
      //const goSecInstall = (await tasks.execute(`curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b `${goPathBin}``)).stdOut;

      const abc = await tasks.execute(`curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b ${goPathBin}`)
      if (abc) {
        let cdtogoRoot = (await tasks.execute(`ls -lrt ${goPathBin}`)).stdOut;
        tasks.info("cdtogoRoot:" + cdtogoRoot)
        tasks.info("GO Sec installed successfully")
        tasks.info("Executing GO sec")
        const goSecRun = ((await tasks.execute(`${goPathBin}/gosec -include=G101`)).stdOut);
        if (goSecRun) {
          tasks.info("Successfully ran GO sec")
        }
      }
    } else {
      tasks.info("Go is not installed. Hence GO Sec cant be run")
    }
  }catch (e){

  }
}
module.exports = go_sec_old;
