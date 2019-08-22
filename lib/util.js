"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function _filterVersion(stdmsg) {
    const cliVersion = stdmsg.match('(\\d+\\.)(\\d+\\.)(\\d+)');
    if (cliVersion)
        return cliVersion[0];
    else
        return '0.0.0';
}
exports._filterVersion = _filterVersion;
//# sourceMappingURL=util.js.map