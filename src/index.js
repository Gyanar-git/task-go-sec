const staticTest = require("./go_sec");
import * as tasks from "jfrog-pipelines-tasks";

function main() {
  staticTest.goSec().then(() => {
    tasks.info("Finished go-sec");
  });
}

main();