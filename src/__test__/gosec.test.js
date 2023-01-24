const tasks = require('jfrog-pipelines-tasks');
const goStaticCheckApp = require("../go_sec");
const path = require("path");

describe('test go sec', () => {
  it('Run Static code analysis for go code', async () => {
    const mockExec = jest.spyOn(tasks, "execute").mockReturnValueOnce({stdOut:"/Users/test/go"});
    const mockExecGosecInstall = jest.spyOn(tasks, "execute").mockReturnValueOnce({stdOut:"path"});
    const mockExecGosec = jest.spyOn(tasks, "execute").mockReturnValue({stdOut:"/Users/go/bin/gosec"});
    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue({});
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    await goStaticCheckApp.go_sec();
    expect(mockExec).toHaveBeenCalledWith("go env GOPATH");
    expect(mockExecGosecInstall).toHaveBeenCalledWith("curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b [object Object]");
    expect(mockExecGosec).toHaveBeenCalledWith("[object Object]/gosec -version");
    expect(mockPathJoin).toHaveBeenCalled();
    expect(mockPathAppend).toHaveBeenCalled();
  })


  it('should throw warning when go is not installed', async () => {
    //const slackInt = 'int_slack'
    jest.spyOn(tasks, 'execute')
      .mockImplementation(() => {
        return {}
      })
    const warningSpy = jest.spyOn(tasks, 'warning');
    await goStaticCheckApp.go_sec();
    expect(warningSpy).toHaveBeenCalledWith("Not able to find Go which is mandatory for gosec.Hence couldn’t perform static check analysis, please use setup-go task")
  })

})
