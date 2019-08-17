"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const execP = util_1.promisify(child_process_1.exec);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let toolPath;
            toolPath = tc.find('aws', '*');
            if (!toolPath) {
                const downloadUrl = `https://s3.amazonaws.com/aws-cli/awscli-bundle.zip`;
                const downloadPath = yield tc.downloadTool(downloadUrl);
                //const extPath = await tc.extractZip(downloadPath)
                const extPath = `${downloadPath}/../unpacked`;
                yield execP(`unzip ${downloadPath} -d ${extPath}`);
                const installPath = `${extPath}/.local/lib/aws`;
                const binPath = `${installPath}/bin`;
                yield execP(`${extPath}/awscli-bundle/install -i ${installPath}`);
                new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    child_process_1.exec(`${binPath}/aws --version`, (err, stout, sterr) => __awaiter(this, void 0, void 0, function* () {
                        const response = err ? stout : sterr;
                        const regex = /(\d+\.)(\d+\.)(\d+)/g;
                        const cliVersion = response.match(regex);
                        if (cliVersion !== null) {
                            const cachedPath = yield tc.cacheDir(binPath, 'aws', cliVersion[0]);
                            core.addPath(cachedPath);
                            resolve();
                        }
                        else {
                            reject();
                        }
                    }));
                }));
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.run = run;
run();
