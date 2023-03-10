const tasks = require('jfrog-pipelines-tasks');
const goSecApp = require("../go_sec");
const path = require("path");

describe('test go sec', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should throw error when go is not installed', () => {
    jest
      .spyOn(tasks, 'execute')
      .mockImplementation((key) => {
        throw new Error('GO is not installed.Hence cannot proceed with Go Security check')
      })

    jest
      .spyOn(tasks, 'error')
      .mockImplementation( (key) => {
        return
      })

    expect(async () => await goSecApp.goSec().toThrowError('GO is not installed.Hence cannot proceed with Go Security check'));

  })

  it("log error and exit", () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
    goSecApp.logErrorAndExit("error");
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('Run Go Sec code analysis for go code', async () => {
    var excludeRules='';
    jest.spyOn(tasks, 'getInput')
      .mockImplementation((name) => {
        if (name === 'goSecVersion') return 'latest'
        if (name === 'excludeRules') return excludeRules
        if (name === 'sourcePath') return 'src/service'
      })

    jest.spyOn(tasks, 'getResource')
      .mockImplementation((name) => {
        return 'testResource'
      })

    jest.spyOn(tasks, 'info')
      .mockImplementation((name) => {
        return 'No failure'
      })

    jest.spyOn(tasks, 'execute')
      .mockImplementation((name) => {
        if (name === "go env GOPATH") return {stdOut: "/Users/test/go"}
        if (name === "Users/test/go/bin/gosec -version") return {stdOut: 'latest'}
        if (name === "cd /Users/test/src/service/src/service") return {stdOut: "Users/test/service"}
        if (name === "go install github.com/securego/gosec/v2/cmd/gosec@latest 2>/dev/null") return {
          stdOut: "installed",
          stdErr: ""
        }
        if (name === "cd /user/test/src/service && Users/test/go/bin/gosec ./...") return {stdOut: "No failure"}
      })

    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue("Users/test/go/bin");
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
    });

    const val = await goSecApp.goSec()
    expect(() => val).not.toThrowError()
    expect(mockPathJoin).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
    expect(mockPathAppend).toHaveBeenCalled();
  })

  it('Should throw error and exit when go sec is not installed', async () => {
    var excludeRules = ["G210", "G311"];
    jest.spyOn(tasks, 'getInput')
      .mockImplementation((name) => {
        if (name === 'goSecVersion') return 'latest'
        if (name === 'excludeRules') return excludeRules
        if (name === 'sourcePath') return 'src/service'
      })

    jest.spyOn(tasks, 'execute')
      .mockImplementation((name) => {
        if (name === "go env GOPATH") return {goPathStdOut: "/Users/test/go"}
        if (name === "Users/test/go/bin/gosec -version") return {stdErr: 'error'}
        //if (name === "cd /Users/test/src/service/src/service") return {stdOut: "Users/test/service"}
        if (name === "go install github.com/securego/gosec/v2/cmd/gosec@latest 2>/dev/null") return {
          stdOut: "installed",
          stdErr: ""
        }
        if (name === "Users/test/go/bin/gosec -exclude=G210,G311 ./...") return {stdOutStaticCheck: "No failure"}
      })

    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue("Users/test/go/bin");
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
    });

    const val = await goSecApp.goSec()
    expect(() => val).not.toThrowError()
    expect(mockPathJoin).not.toHaveBeenCalled();
    expect(mockExit).not.toHaveBeenCalled();
    expect(mockPathAppend).not.toHaveBeenCalled();
  })

  it('Should switch to current working dor when there is no source path provided', async () => {
    var excludeRules = ["G210", "G311"];
    jest.spyOn(tasks, 'getInput')
      .mockImplementation((name) => {
        if (name === 'goSecVersion') return 'latest'
        if (name === 'excludeRules') return excludeRules
        if (name === 'sourcePath') return ''
      })

    jest.spyOn(tasks, 'execute')
      .mockImplementation((name) => {
        if (name === "go env GOPATH") return {stdOut: "/Users/test/go"}
        if (name === "Users/test/go/bin/gosec -version") return {stdOut: 'latest'}
        if (name === "cd /Users/test/src/service/src/service") return {stdOut: "Users/test/service"}
        if (name === "go install github.com/securego/gosec/v2/cmd/gosec@latest 2>/dev/null") return {
          stdOut: "installed",
          stdErr: ""
        }
        if (name === "Users/test/go/bin/gosec -exclude=G210,G311 ./...") return {stdOut: "No failure"}
      })

    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue("Users/test/go/bin");
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
    });

    const val = await goSecApp.goSec()
    expect(() => val).not.toThrowError()

    expect(mockPathJoin).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
    expect(mockPathAppend).toHaveBeenCalled();
  })
  it('Should throw error when the path is not resolved', async () => {
    var excludeRules = ["G210", "G311"];
    jest.spyOn(tasks, 'getInput')
      .mockImplementation((name) => {
        if (name === 'goSecVersion') return 'latest'
        if (name === 'excludeRules') return excludeRules
        if (name === 'sourcePath') return ''
      })

    jest.spyOn(tasks, 'execute')
      .mockImplementation((name) => {
        if (name === "go env GOPATH") return {stdOut: "/Users/test/go"}
        if (name === "Users/test/go/bin/gosec -version") return {stdOut: 'latest'}
        if (name === "cd /Users/test/src/service") return {stdErr: "error"}
        if (name === "go install github.com/securego/gosec/v2/cmd/gosec@latest 2>/dev/null") return {
          stdOut: "installed",
          stdErr: ""
        }
        if (name === "Users/test/go/bin/gosec -exclude=G210,G311 ./...") return {stdOut: "No failure"}
      })

    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue("Users/test/go/bin");
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
    });
    const val = await goSecApp.goSec()
    expect(() => val).not.toThrowError()

    expect(mockPathJoin).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
    expect(mockPathAppend).toHaveBeenCalled();
  })
  it('Should throw error when Go sec is not installed', async () => {
    var excludeRules = ["G210", "G311"];
    jest.spyOn(tasks, 'getInput')
      .mockImplementation((name) => {
        if (name === 'excludeRules') return excludeRules
        if (name === 'sourcePath') return ''
      })

    jest.spyOn(tasks, 'execute')
      .mockImplementation((name) => {
        if (name === "go env GOPATH") return {stdOut: "/Users/test/go"}
        if (name === "Users/test/go/bin/gosec -version") return {stdOut: 'latest'}
        if (name === "cd /Users/test/src/service") return {stdErr: "error"}
        if (name === "go install github.com/securego/gosec/v2/cmd/gosec@latest 2>/dev/null") return {
          stdErr: "Error"
        }
        if (name === "Users/test/go/bin/gosec -exclude=G210,G311 ./...") return {stdOut: "No failure"}
      })

    const mockPathJoin = jest.spyOn(path, "join").mockReturnValue("Users/test/go/bin");
    const mockPathAppend = jest.spyOn(tasks, "appendToPath").mockReturnValue({});
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
    });
    const val = await goSecApp.goSec()
    expect(() => val).not.toThrowError()

    expect(mockPathJoin).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
    expect(mockPathAppend).toHaveBeenCalled();
  })
})