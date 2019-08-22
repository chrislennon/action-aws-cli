"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
const io_1 = require("@actions/io");
const tool_cache_1 = require("@actions/tool-cache");
// @ts-ignore
const firstline_1 = __importDefault(require("firstline"));
const path_1 = require("path");
const util_1 = require("./util");
const IS_WINDOWS = process.platform === 'win32' ? true : false;
class DownloadExtractInstall {
    constructor(downloadUrl) {
        this.downloadUrl = downloadUrl;
        this.downloadedFile = '';
        this.extractedPath = __dirname;
        const derivedPaths = this._updatePaths(this.extractedPath);
        // @ts-ignore
        const { setupBinary, installedBinaryDir, installDestinationDir, virtualEnvFile, installedBinaryFile } = derivedPaths;
        this.setupBinary = setupBinary;
        this.installDestinationDir = installDestinationDir;
        this.installedBinaryDir = installedBinaryDir;
        this.installedBinaryFile = installedBinaryFile;
        this.virtualEnvFile = virtualEnvFile;
        this.installedVersion = '';
    }
    _updatePaths(extractedPath) {
        const binDir = IS_WINDOWS ? 'Scripts' : 'bin';
        const binFile = IS_WINDOWS ? 'aws.cmd' : 'aws';
        const venvFile = IS_WINDOWS ? 'activate.bat' : 'activate';
        const setupBinary = path_1.join(extractedPath, 'awscli-bundle', 'install');
        const installDestinationDir = path_1.join(extractedPath, '.local', 'lib', 'aws');
        const installedBinaryDir = path_1.join(installDestinationDir, binDir);
        const installedBinaryFile = path_1.join(installedBinaryDir, binFile);
        const virtualEnvFile = path_1.join(installedBinaryDir, venvFile);
        this.setupBinary = setupBinary;
        this.installDestinationDir = installDestinationDir;
        this.installedBinaryDir = installedBinaryDir;
        this.installedBinaryFile = installedBinaryFile;
        this.virtualEnvFile = virtualEnvFile;
        const derivedPaths = {
            setupBinary,
            installDestinationDir,
            installedBinaryDir,
            installedBinaryFile,
            virtualEnvFile
        };
        return derivedPaths;
    }
    async _getCommandOutput(command, args) {
        let stdErr = '';
        const outputFileName = 'output.txt';
        const options = {
            windowsVerbatimArguments: true,
            listeners: {
                stderr: (data) => {
                    stdErr += data.toString();
                }
            }
        };
        command = IS_WINDOWS ? `${command} > ${outputFileName}` : command;
        await exec_1.exec(command, args, options);
        const versionString = IS_WINDOWS ? await firstline_1.default(outputFileName) : stdErr;
        return versionString;
    }
    async _getVersion() {
        const cmd = IS_WINDOWS ? `${this.virtualEnvFile} && ${this.installedBinaryFile}` : this.installedBinaryFile;
        const versionCommandOutput = await this._getCommandOutput(cmd, ['--version']);
        this.installedVersion = util_1._filterVersion(versionCommandOutput);
        return this.installedVersion;
    }
    async downloadFile() {
        this.downloadedFile = await tool_cache_1.downloadTool(this.downloadUrl);
        return this.downloadedFile;
    }
    async extractFile() {
        const filePath = this.downloadedFile;
        /* istanbul ignore next */
        if (process.platform === 'linux') {
            // await extractZip(this.downloadedFile) // This command currently throws an error on linux TODO
            // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
            await exec_1.exec(`unzip ${filePath} -d ${this.extractedPath}`);
        }
        else {
            /* istanbul ignore next */
            this.extractedPath = await tool_cache_1.extractZip(filePath);
            this._updatePaths(this.extractedPath);
        }
        return this.extractedPath;
    }
    async installPackage() {
        const pythonPath = await io_1.which('python', true);
        const installCommand = IS_WINDOWS ? pythonPath : `${this.setupBinary} -i ${this.installDestinationDir}`;
        const installArgs = IS_WINDOWS ? [this.setupBinary, '-i', this.installDestinationDir] : [];
        return await exec_1.exec(installCommand, installArgs);
    }
    async cacheTool() {
        const installedVersion = await this._getVersion();
        const cachedPath = await tool_cache_1.cacheDir(this.installedBinaryDir, 'aws', installedVersion);
        return cachedPath;
    }
}
exports.DownloadExtractInstall = DownloadExtractInstall;
//# sourceMappingURL=toolHandler.js.map