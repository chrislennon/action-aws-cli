"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tool_cache_1 = require("@actions/tool-cache");
const core_1 = require("@actions/core/lib/core");
const toolHandler_1 = require("./toolHandler");
async function _installTool() {
    const toolPath = tool_cache_1.find('aws', '*');
    if (toolPath)
        return toolPath;
    const tool = new toolHandler_1.DownloadExtractInstall('https://s3.amazonaws.com/aws-cli/awscli-bundle.zip');
    await tool.downloadFile();
    await tool.extractFile();
    await tool.installPackage();
    const toolCachePath = await tool.cacheTool();
    await core_1.addPath(toolCachePath);
    return toolCachePath;
}
exports._installTool = _installTool;
if (process.env.NODE_ENV != 'test')
    (async () => await _installTool())();
//# sourceMappingURL=main.js.map