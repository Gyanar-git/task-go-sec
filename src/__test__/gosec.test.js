const tasks = require('jfrog-pipelines-tasks');
const app = require("../index");
const goStaticCheckApp = require("../go_staticcheck");
const path = require("path");

describe('test go static check tasks', () => {
  it('Run Static code analysis for go code', async () => {
    const mockExec = jest.spyOn(tasks, "execute").mockReturnValueOnce({stdOut:"/Users/test/go"});
    const mockExecStaticCheckInstall = jest.spyOn(tasks, "execute").mockReturnValueOnce({stdOut:"path"});
    const mockExecStaticCheck = jest.spyOn(tasks, "execute").mockReturnValue({stdOut:"/Users/gyanaranjanpanigrahi/go/bin/staticcheck"});
    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue({});
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    await goStaticCheckApp.go_staticcheck();
    expect(mockExec).toHaveBeenCalledWith("go env GOPATH");
    expect(mockExecStaticCheckInstall).toHaveBeenCalledWith("go install \"honnef.co/go/tools/cmd/staticcheck@latest\"");
    expect(mockExecStaticCheck).toHaveBeenCalledWith("go install \"honnef.co/go/tools/cmd/staticcheck@latest\"");
    expect(mockPathJoin).toHaveBeenCalled();
    expect(mockPathAppend).toHaveBeenCalled();
  })


  it('should throw error when integration is not available', async () => {
    //const slackInt = 'int_slack'
    jest.spyOn(tasks, 'execute')
      .mockImplementation(() => {
        return {}
      })
    const warningSpy = jest.spyOn(tasks, 'warning');
    await goStaticCheckApp.go_staticcheck();
    expect(warningSpy).toHaveBeenCalledWith("Not able to find Go which is mandatory for static check couldn’t perform static check analysis, please use setup-go task")
  })

})
