"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
function _filterVersion(stdmsg) {
    const cliVersion = stdmsg.match('(\\d+\\.)(\\d+\\.)(\\d+)');
    if (cliVersion)
        return cliVersion[0];
    else
        return '0.0.0';
}
exports._filterVersion = _filterVersion;
function _readFile(path, usrOpts) {
    const opts = {
        encoding: 'utf8',
        lineEnding: '\n'
    };
    Object.assign(opts, usrOpts);
    return new Promise((resolve, reject) => {
        const rs = fs.createReadStream(path, { encoding: opts.encoding });
        let acc = '';
        let pos = 0;
        let index;
        rs
            .on('data', chunk => {
            index = chunk.indexOf(opts.lineEnding);
            acc += chunk;
            if (index === -1) {
                pos += chunk.length;
            }
            else {
                pos += index;
                rs.close();
            }
        })
            .on('close', () => resolve(acc.slice(acc.charCodeAt(0) === 0xFEFF ? 1 : 0, pos)))
            .on('error', err => reject(err));
    });
}
exports._readFile = _readFile;
;
//# sourceMappingURL=util.js.map