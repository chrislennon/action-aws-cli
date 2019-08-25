export declare class DownloadExtractInstall {
    private readonly downloadUrl;
    private readonly fileType;
    constructor(downloadUrl: string);
    private _getCommandOutput;
    private _getVersion;
    downloadFile(): Promise<string>;
    extractFile(filePath: string): Promise<string>;
    installPackage(installCommand: string, installArgs: string[]): Promise<number>;
    cacheTool(installedBinary: string, logFile: string): Promise<string>;
}
