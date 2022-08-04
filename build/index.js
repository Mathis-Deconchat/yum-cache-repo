"use strict";
// dans la config: stocker les whitelist de site de repository
// Stocker les paquets en cache: metadata dans un sqlite, fichiers eux même sous pseudonyme_uuid dans un dossier quelconque
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = void 0;
// Serveur proxy qui a partir d'une URL [http://cacherepo.webinage.net/http/dl.rockylinux.org/$contentdir/$releasever/BaseOS/$basearch/os/CACHEREPOMARKER/] 
// est capable de reconstruire un chemin de paquet valide et de l
var axios_1 = __importDefault(require("axios"));
var express_1 = __importDefault(require("express"));
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var app = (0, express_1.default)();
var port = 8080;
var bind_addr = '127.0.0.1';
var download_dirpath = path_1.default.resolve(path_1.default.join(__dirname, '..', 'downloaded_packages'));
app.get('*', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var urlparse_regex, matched_url, proto, repo_domain_name, repo_url, content_url, final_url, rpmname_regex, matched_rpm_filename;
    return __generator(this, function (_a) {
        console.log(req.url);
        urlparse_regex = new RegExp(Buffer.from('XlwvKGh0dHBzPylcLyguKz9cLykoKD86LipcLyk/KUNBQ0hFUkVQT01BUktFUlwvKC4qKQ==', 'base64').toString('utf-8'), 'g');
        matched_url = Array.from(req.url.matchAll(urlparse_regex))[0];
        console.log(urlparse_regex);
        console.log(matched_url);
        if (!matched_url) {
            res.status(400).send("YPHC says: Bad URL");
            return [2 /*return*/, 1];
        }
        proto = matched_url[1];
        repo_domain_name = matched_url[2];
        repo_url = matched_url[3];
        content_url = matched_url[4];
        final_url = proto + '://' + repo_domain_name + repo_url + content_url;
        console.log(final_url);
        rpmname_regex = new RegExp(Buffer.from('KD88PVwvKVteXC9dK1wucnBtJA==', 'base64').toString('utf-8'), 'g');
        matched_rpm_filename = Array.from(req.url.match(rpmname_regex))[0];
        if (matched_rpm_filename) {
            downloadFile(final_url, path_1.default.resolve(path_1.default.join(download_dirpath, matched_rpm_filename)));
        }
        //const proxied_request_res = await axios.get(final_url)
        // console.log(proxied_request_res)
        // res.send('Réussi sur url ' + final_url + ' avec code: ' + proxied_request_res.statusCode + '\n')
        res.redirect(final_url);
        return [2 /*return*/];
    });
}); });
app.listen(port, bind_addr, function () {
    console.log("Example app listening on port " + port);
});
function downloadFile(fileUrl, outputLocationPath) {
    return __awaiter(this, void 0, void 0, function () {
        var writer;
        return __generator(this, function (_a) {
            console.log(outputLocationPath);
            writer = (0, fs_1.createWriteStream)(outputLocationPath);
            return [2 /*return*/, (0, axios_1.default)({
                    method: 'get',
                    url: fileUrl,
                    responseType: 'stream',
                }).then(function (response) {
                    return new Promise(function (resolve, reject) {
                        response.data.pipe(writer);
                        var error = null;
                        writer.on('error', function (err) {
                            error = err;
                            writer.close();
                            reject(err);
                        });
                        writer.on('close', function () {
                            if (!error) {
                                resolve(true);
                            }
                        });
                    });
                })];
        });
    });
}
exports.downloadFile = downloadFile;
