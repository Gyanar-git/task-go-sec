const tasks = require('jfrog-pipelines-tasks');
const goStaticCheckApp = require("../go_sec");
const path = require("path");

describe('test go sec', () => {
  it('should throw warning when go is not installed', async () => {
    //const slackInt = 'int_slack'
    jest.spyOn(tasks, 'execute')
      .mockImplementation(() => {
        return {}
      })
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const errorSpy = jest.spyOn(tasks, 'error');
    await goStaticCheckApp.goSec();
    expect(mockExit).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('Run Go Sec code analysis for go code', async () => {
    const mockExec = jest.spyOn(tasks, "execute").mockReturnValueOnce({stdOut:"/Users/test/go"});
    const mockExecGosecInstall = jest.spyOn(tasks, "execute").mockReturnValueOnce({stdOut:"path"});
    const mockExecGosec = jest.spyOn(tasks, "execute").mockReturnValue({stdOut:"/Users/go/bin/gosec"});
    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue({});
    const mockResolvedPath = jest.spyOn(path, "resolve").mockReturnValue({});
    const mockCurWorkDir = jest.spyOn(tasks, "getWorkingDir").mockReturnValue({});
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    await goStaticCheckApp.goSec();
    expect(mockExec).toHaveBeenCalledWith("go env GOPATH");
    expect(mockExecGosecInstall).toHaveBeenCalledWith("curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b [object Object]");
    expect(mockExecGosec).toHaveBeenCalledWith("[object Object]/gosec -version");
    expect(mockPathJoin).toHaveBeenCalled();
    expect(mockPathAppend).toHaveBeenCalled();
    expect(mockResolvedPath).not.toHaveBeenCalled();
    expect(mockCurWorkDir).toHaveBeenCalled();
  })
})
