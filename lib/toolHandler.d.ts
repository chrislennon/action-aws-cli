export declare class DownloadExtractInstall {
    private readonly downloadUrl;
    private downloadedFile;
    private extractedPath;
    private setupBinary;
    private installDestinationDir;
    private installedBinaryDir;
    private installedBinaryFile;
    private installedVersion;
    private virtualEnvFile;
    constructor(downloadUrl: string);
    private _updatePaths;
    private _getCommandOutput;
    private _getVersion;
    downloadFile(): Promise<string>;
    extractFile(): Promise<string>;
    installPackage(): Promise<number>;
    cacheTool(): Promise<string>;
}
