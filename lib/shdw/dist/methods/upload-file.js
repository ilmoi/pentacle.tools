"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../utils/common");
const crypto_1 = __importDefault(require("crypto"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account.
 * @param {File | ShadowFile} data - File or ShadowFile object, file extensions should be included in the name property of ShadowFiles.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowUploadResponse} File location and transaction signature.
 */
function uploadFile(key, data, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileErrors = [];
        let fileBuffer;
        let form;
        let file;
        if (!common_1.isBrowser) {
            data = data;
            form = new form_data_1.default();
            file = data.file;
            form.append("file", file, data.name);
            fileBuffer = file;
        }
        else {
            file = data;
            form = new FormData();
            form.append("file", file, file.name);
            fileBuffer = Buffer.from(new Uint8Array(yield file.arrayBuffer()));
        }
        if (fileBuffer.byteLength > 1073741824 * 1) {
            fileErrors.push({
                file: data.name,
                erorr: "Exceeds the 1GB limit.",
            });
        }
        /**
         *
         * Users must remember to include the file extension when uploading from Node.
         *
         */
        //   if (!isBrowser && data.name.lastIndexOf(".") == -1) {
        //     fileErrors.push({
        //       file: data.name,
        //       error: "File extension must be included.",
        //     });
        //   }
        if (fileErrors.length) {
            return Promise.reject(fileErrors);
        }
        if (!this.userInfo) {
            return Promise.reject("You have not created a storage account on Shadow Drive yet. Please see the 'create-storage-account' command to get started.");
        }
        const fileHashSum = crypto_1.default.createHash("sha256");
        const fileNameHashSum = crypto_1.default.createHash("sha256");
        fileHashSum.update(Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer));
        fileNameHashSum.update(data.name);
        const fileHash = fileHashSum.digest("hex");
        const fileNameHash = fileNameHashSum.digest("hex");
        try {
            const msg = new TextEncoder().encode(`Shadow Drive Signed Message:\nStorage Account: ${key}\nUpload files with hash: ${fileNameHash}`);
            let msgSig;
            if (!this.wallet.signMessage) {
                msgSig = tweetnacl_1.default.sign.detached(msg, this.wallet.payer.secretKey);
            }
            else {
                msgSig = yield this.wallet.signMessage(msg);
            }
            const encodedMsg = bytes_1.bs58.encode(msgSig);
            form.append("fileNames", data.name);
            form.append("message", encodedMsg);
            form.append("storage_account", key.toString());
            form.append("signer", this.wallet.publicKey.toString());
        }
        catch (e) {
            return Promise.reject(new Error(e));
        }
        try {
            const uploadResponse = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/upload`, {
                method: "POST",
                //@ts-ignore
                body: form,
            });
            if (!uploadResponse.ok) {
                return Promise.reject(new Error(`Server response status code: ${uploadResponse.status} \n 
				  Server response status message: ${(yield uploadResponse.json()).error}`));
            }
            const responseJson = yield uploadResponse.json();
            return Promise.resolve(responseJson);
        }
        catch (e) {
            return Promise.reject(new Error(e));
        }
    });
}
exports.default = uploadFile;
//# sourceMappingURL=upload-file.js.map