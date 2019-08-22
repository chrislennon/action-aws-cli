"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var io = require("@actions/io");
var fs = require("fs");
var os = require("os");
var path = require("path");
var httpm = require("typed-rest-client/HttpClient");
var semver = require("semver");
var uuidV4 = require("uuid/v4");
var exec_1 = require("@actions/exec/lib/exec");
var assert_1 = require("assert");
var HTTPError = /** @class */ (function (_super) {
    __extends(HTTPError, _super);
    function HTTPError(httpStatusCode) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Unexpected HTTP response: " + httpStatusCode) || this;
        _this.httpStatusCode = httpStatusCode;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return HTTPError;
}(Error));
exports.HTTPError = HTTPError;
var IS_WINDOWS = process.platform === 'win32';
var userAgent = 'actions/tool-cache';
// On load grab temp directory and cache directory and remove them from env (currently don't want to expose this)
var tempDirectory = process.env['RUNNER_TEMP'] || '';
var cacheRoot = process.env['RUNNER_TOOL_CACHE'] || '';
// If directories not found, place them in common temp locations
if (!tempDirectory || !cacheRoot) {
    var baseLocation = void 0;
    if (IS_WINDOWS) {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
    }
    else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users';
        }
        else {
            baseLocation = '/home';
        }
    }
    if (!tempDirectory) {
        tempDirectory = path.join(baseLocation, 'actions', 'temp');
    }
    if (!cacheRoot) {
        cacheRoot = path.join(baseLocation, 'actions', 'cache');
    }
}
/**
 * Download a tool from an url and stream it into a file
 *
 * @param url       url of tool to download
 * @returns         path to downloaded tool
 */
function downloadTool(url) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Wrap in a promise so that we can resolve from within stream callbacks
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var http, destPath_1, response_1, err, file_1, err_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                http = new httpm.HttpClient(userAgent, [], {
                                    allowRetries: true,
                                    maxRetries: 3
                                });
                                destPath_1 = path.join(tempDirectory, uuidV4());
                                return [4 /*yield*/, io.mkdirP(tempDirectory)];
                            case 1:
                                _a.sent();
                                core.debug("Downloading " + url);
                                core.debug("Downloading " + destPath_1);
                                if (fs.existsSync(destPath_1)) {
                                    throw new Error("Destination file path " + destPath_1 + " already exists");
                                }
                                return [4 /*yield*/, http.get(url)];
                            case 2:
                                response_1 = _a.sent();
                                if (response_1.message.statusCode !== 200) {
                                    err = new HTTPError(response_1.message.statusCode);
                                    core.debug("Failed to download from \"" + url + "\". Code(" + response_1.message.statusCode + ") Message(" + response_1.message.statusMessage + ")");
                                    throw err;
                                }
                                file_1 = fs.createWriteStream(destPath_1);
                                file_1.on('open', function () { return __awaiter(_this, void 0, void 0, function () {
                                    var stream;
                                    return __generator(this, function (_a) {
                                        try {
                                            stream = response_1.message.pipe(file_1);
                                            stream.on('close', function () {
                                                core.debug('download complete');
                                                resolve(destPath_1);
                                            });
                                        }
                                        catch (err) {
                                            core.debug("Failed to download from \"" + url + "\". Code(" + response_1.message.statusCode + ") Message(" + response_1.message.statusMessage + ")");
                                            reject(err);
                                        }
                                        return [2 /*return*/];
                                    });
                                }); });
                                file_1.on('error', function (err) {
                                    file_1.end();
                                    reject(err);
                                });
                                return [3 /*break*/, 4];
                            case 3:
                                err_1 = _a.sent();
                                reject(err_1);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.downloadTool = downloadTool;
/**
 * Extract a .7z file
 *
 * @param file     path to the .7z file
 * @param dest     destination directory. Optional.
 * @param _7zPath  path to 7zr.exe. Optional, for long path support. Most .7z archives do not have this
 * problem. If your .7z archive contains very long paths, you can pass the path to 7zr.exe which will
 * gracefully handle long paths. By default 7zdec.exe is used because it is a very small program and is
 * bundled with the tool lib. However it does not support long paths. 7zr.exe is the reduced command line
 * interface, it is smaller than the full command line interface, and it does support long paths. At the
 * time of this writing, it is freely available from the LZMA SDK that is available on the 7zip website.
 * Be sure to check the current license agreement. If 7zr.exe is bundled with your action, then the path
 * to 7zr.exe can be pass to this function.
 * @returns        path to the destination directory
 */
function extract7z(file, dest, _7zPath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, originalCwd, args, options, escapedScript, escapedFile, escapedTarget, command, args, options, powershellPath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    assert_1.ok(IS_WINDOWS, 'extract7z() not supported on current OS');
                    assert_1.ok(file, 'parameter "file" is required');
                    _a = dest;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, _createExtractFolder(dest)];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    dest = _a;
                    originalCwd = process.cwd();
                    process.chdir(dest);
                    if (!_7zPath) return [3 /*break*/, 7];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, , 5, 6]);
                    args = [
                        'x',
                        '-bb1',
                        '-bd',
                        '-sccUTF-8',
                        file
                    ];
                    options = {
                        silent: true
                    };
                    return [4 /*yield*/, exec_1.exec("\"" + _7zPath + "\"", args, options)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    process.chdir(originalCwd);
                    return [7 /*endfinally*/];
                case 6: return [3 /*break*/, 12];
                case 7:
                    escapedScript = path
                        .join(__dirname, '..', 'scripts', 'Invoke-7zdec.ps1')
                        .replace(/'/g, "''")
                        .replace(/"|\n|\r/g, '') // double-up single quotes, remove double quotes and newlines
                    ;
                    escapedFile = file.replace(/'/g, "''").replace(/"|\n|\r/g, '');
                    escapedTarget = dest.replace(/'/g, "''").replace(/"|\n|\r/g, '');
                    command = "& '" + escapedScript + "' -Source '" + escapedFile + "' -Target '" + escapedTarget + "'";
                    args = [
                        '-NoLogo',
                        '-Sta',
                        '-NoProfile',
                        '-NonInteractive',
                        '-ExecutionPolicy',
                        'Unrestricted',
                        '-Command',
                        command
                    ];
                    options = {
                        silent: true
                    };
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    return [4 /*yield*/, io.which('powershell', true)];
                case 9:
                    powershellPath = _b.sent();
                    return [4 /*yield*/, exec_1.exec("\"" + powershellPath + "\"", args, options)];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    process.chdir(originalCwd);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/, dest];
            }
        });
    });
}
exports.extract7z = extract7z;
/**
 * Extract a tar
 *
 * @param file     path to the tar
 * @param dest     destination directory. Optional.
 * @param flags    flags for the tar. Optional.
 * @returns        path to the destination directory
 */
function extractTar(file, dest, flags) {
    if (flags === void 0) { flags = 'xz'; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, tarPath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!file) {
                        throw new Error("parameter 'file' is required");
                    }
                    _a = dest;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, _createExtractFolder(dest)];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    dest = _a;
                    return [4 /*yield*/, io.which('tar', true)];
                case 3:
                    tarPath = _b.sent();
                    return [4 /*yield*/, exec_1.exec("\"" + tarPath + "\"", [flags, '-C', dest, '-f', file])];
                case 4:
                    _b.sent();
                    return [2 /*return*/, dest];
            }
        });
    });
}
exports.extractTar = extractTar;
/**
 * Extract a zip
 *
 * @param file     path to the zip
 * @param dest     destination directory. Optional.
 * @returns        path to the destination directory
 */
function extractZip(file, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!file) {
                        throw new Error("parameter 'file' is required");
                    }
                    _a = dest;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, _createExtractFolder(dest)];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    dest = _a;
                    if (!IS_WINDOWS) return [3 /*break*/, 4];
                    return [4 /*yield*/, extractZipWin(file, dest)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 4:
                    if (!(process.platform === 'darwin')) return [3 /*break*/, 6];
                    return [4 /*yield*/, extractZipDarwin(file, dest)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, extractZipNix(file, dest)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [2 /*return*/, dest];
            }
        });
    });
}
exports.extractZip = extractZip;
function extractZipWin(file, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var escapedFile, escapedDest, command, powershellPath, args;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    escapedFile = file.replace(/'/g, "''").replace(/"|\n|\r/g, '') // double-up single quotes, remove double quotes and newlines
                    ;
                    escapedDest = dest.replace(/'/g, "''").replace(/"|\n|\r/g, '');
                    command = "$ErrorActionPreference = 'Stop' ; try { Add-Type -AssemblyName System.IO.Compression.FileSystem } catch { } ; [System.IO.Compression.ZipFile]::ExtractToDirectory('" + escapedFile + "', '" + escapedDest + "')";
                    return [4 /*yield*/, io.which('powershell')];
                case 1:
                    powershellPath = _a.sent();
                    args = [
                        '-NoLogo',
                        '-Sta',
                        '-NoProfile',
                        '-NonInteractive',
                        '-ExecutionPolicy',
                        'Unrestricted',
                        '-Command',
                        command
                    ];
                    return [4 /*yield*/, exec_1.exec("\"" + powershellPath + "\"", args)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function extractZipNix(file, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var unzipPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    unzipPath = path.join(__dirname, '..', 'scripts', 'externals', 'unzip');
                    return [4 /*yield*/, exec_1.exec("\"" + unzipPath + "\"", [file], { cwd: dest })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function extractZipDarwin(file, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var unzipPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    unzipPath = path.join(__dirname, '..', 'scripts', 'externals', 'unzip-darwin');
                    return [4 /*yield*/, exec_1.exec("\"" + unzipPath + "\"", [file], { cwd: dest })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Caches a directory and installs it into the tool cacheDir
 *
 * @param sourceDir    the directory to cache into tools
 * @param tool          tool name
 * @param version       version of the tool.  semver format
 * @param arch          architecture of the tool.  Optional.  Defaults to machine architecture
 */
function cacheDir(sourceDir, tool, version, arch) {
    return __awaiter(this, void 0, void 0, function () {
        var destPath, _i, _a, itemName, s;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    version = semver.clean(version) || version;
                    arch = arch || os.arch();
                    core.debug("Caching tool " + tool + " " + version + " " + arch);
                    core.debug("source dir: " + sourceDir);
                    if (!fs.statSync(sourceDir).isDirectory()) {
                        throw new Error('sourceDir is not a directory');
                    }
                    return [4 /*yield*/, _createToolPath(tool, version, arch)
                        // copy each child item. do not move. move can fail on Windows
                        // due to anti-virus software having an open handle on a file.
                    ];
                case 1:
                    destPath = _b.sent();
                    _i = 0, _a = fs.readdirSync(sourceDir);
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    itemName = _a[_i];
                    s = path.join(sourceDir, itemName);
                    return [4 /*yield*/, io.cp(s, destPath, { recursive: true })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    // write .complete
                    _completeToolPath(tool, version, arch);
                    return [2 /*return*/, destPath];
            }
        });
    });
}
exports.cacheDir = cacheDir;
/**
 * Caches a downloaded file (GUID) and installs it
 * into the tool cache with a given targetName
 *
 * @param sourceFile    the file to cache into tools.  Typically a result of downloadTool which is a guid.
 * @param targetFile    the name of the file name in the tools directory
 * @param tool          tool name
 * @param version       version of the tool.  semver format
 * @param arch          architecture of the tool.  Optional.  Defaults to machine architecture
 */
function cacheFile(sourceFile, targetFile, tool, version, arch) {
    return __awaiter(this, void 0, void 0, function () {
        var destFolder, destPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    version = semver.clean(version) || version;
                    arch = arch || os.arch();
                    core.debug("Caching tool " + tool + " " + version + " " + arch);
                    core.debug("source file: " + sourceFile);
                    if (!fs.statSync(sourceFile).isFile()) {
                        throw new Error('sourceFile is not a file');
                    }
                    return [4 /*yield*/, _createToolPath(tool, version, arch)
                        // copy instead of move. move can fail on Windows due to
                        // anti-virus software having an open handle on a file.
                    ];
                case 1:
                    destFolder = _a.sent();
                    destPath = path.join(destFolder, targetFile);
                    core.debug("destination file " + destPath);
                    return [4 /*yield*/, io.cp(sourceFile, destPath)
                        // write .complete
                    ];
                case 2:
                    _a.sent();
                    // write .complete
                    _completeToolPath(tool, version, arch);
                    return [2 /*return*/, destFolder];
            }
        });
    });
}
exports.cacheFile = cacheFile;
/**
 * Finds the path to a tool version in the local installed tool cache
 *
 * @param toolName      name of the tool
 * @param versionSpec   version of the tool
 * @param arch          optional arch.  defaults to arch of computer
 */
function find(toolName, versionSpec, arch) {
    if (!toolName) {
        throw new Error('toolName parameter is required');
    }
    if (!versionSpec) {
        throw new Error('versionSpec parameter is required');
    }
    arch = arch || os.arch();
    // attempt to resolve an explicit version
    if (!_isExplicitVersion(versionSpec)) {
        var localVersions = findAllVersions(toolName, arch);
        var match = _evaluateVersions(localVersions, versionSpec);
        versionSpec = match;
    }
    // check for the explicit version in the cache
    var toolPath = '';
    if (versionSpec) {
        versionSpec = semver.clean(versionSpec) || '';
        var cachePath = path.join(cacheRoot, toolName, versionSpec, arch);
        core.debug("checking cache: " + cachePath);
        if (fs.existsSync(cachePath) && fs.existsSync(cachePath + ".complete")) {
            core.debug("Found tool in cache " + toolName + " " + versionSpec + " " + arch);
            toolPath = cachePath;
        }
        else {
            core.debug('not found');
        }
    }
    return toolPath;
}
exports.find = find;
/**
 * Finds the paths to all versions of a tool that are installed in the local tool cache
 *
 * @param toolName  name of the tool
 * @param arch      optional arch.  defaults to arch of computer
 */
function findAllVersions(toolName, arch) {
    var versions = [];
    arch = arch || os.arch();
    var toolPath = path.join(cacheRoot, toolName);
    if (fs.existsSync(toolPath)) {
        var children = fs.readdirSync(toolPath);
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            if (_isExplicitVersion(child)) {
                var fullPath = path.join(toolPath, child, arch || '');
                if (fs.existsSync(fullPath) && fs.existsSync(fullPath + ".complete")) {
                    versions.push(child);
                }
            }
        }
    }
    return versions;
}
exports.findAllVersions = findAllVersions;
function _createExtractFolder(dest) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!dest) {
                        // create a temp dir
                        dest = path.join(tempDirectory, uuidV4());
                    }
                    return [4 /*yield*/, io.mkdirP(dest)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, dest];
            }
        });
    });
}
function _createToolPath(tool, version, arch) {
    return __awaiter(this, void 0, void 0, function () {
        var folderPath, markerPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    folderPath = path.join(cacheRoot, tool, semver.clean(version) || version, arch || '');
                    core.debug("destination " + folderPath);
                    markerPath = folderPath + ".complete";
                    return [4 /*yield*/, io.rmRF(folderPath)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, io.rmRF(markerPath)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, io.mkdirP(folderPath)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, folderPath];
            }
        });
    });
}
function _completeToolPath(tool, version, arch) {
    var folderPath = path.join(cacheRoot, tool, semver.clean(version) || version, arch || '');
    var markerPath = folderPath + ".complete";
    fs.writeFileSync(markerPath, '');
    core.debug('finished caching tool');
}
function _isExplicitVersion(versionSpec) {
    var c = semver.clean(versionSpec) || '';
    core.debug("isExplicit: " + c);
    var valid = semver.valid(c) != null;
    core.debug("explicit? " + valid);
    return valid;
}
function _evaluateVersions(versions, versionSpec) {
    var version = '';
    core.debug("evaluating " + versions.length + " versions");
    versions = versions.sort(function (a, b) {
        if (semver.gt(a, b)) {
            return 1;
        }
        return -1;
    });
    for (var i = versions.length - 1; i >= 0; i--) {
        var potential = versions[i];
        var satisfied = semver.satisfies(potential, versionSpec);
        if (satisfied) {
            version = potential;
            break;
        }
    }
    if (version) {
        core.debug("matched: " + version);
    }
    else {
        core.debug('match not found');
    }
    return version;
}
