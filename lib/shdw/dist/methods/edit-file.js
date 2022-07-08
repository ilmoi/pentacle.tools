"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const anchor = __importStar(require("@project-serum/anchor"));
const common_1 = require("../utils/common");
const crypto_1 = __importDefault(require("crypto"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account
 * @param {string} url - URL of existing file
 * @param {File | ShadowFile} data - File or ShadowFile object, file extensions should be included in the name property of ShadowFiles.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowUploadResponse} - File location and transaction signature
 */
function editFile(key, url, data, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileErrors = [];
        let fileBuffer;
        let form;
        let file;
        let selectedAccount;
        switch (version.toLocaleLowerCase()) {
            case "v1":
                selectedAccount = yield this.program.account.storageAccount.fetch(key);
                break;
            case "v2":
                selectedAccount = yield this.program.account.storageAccountV2.fetch(key);
                break;
        }
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
                file: file,
                erorr: "Exceeds the 1GB limit.",
            });
        }
        if (fileErrors.length) {
            return Promise.reject(fileErrors);
        }
        const userInfoAccount = yield this.connection.getAccountInfo(this.userInfo);
        if (userInfoAccount === null) {
            return Promise.reject(new Error("You have not created a storage account on Shadow Drive yet. Please see the 'create-storage-account' command to get started."));
        }
        const existingFileData = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/get-object-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                location: url,
            }),
        });
        const fileDataResponse = yield existingFileData.json();
        const fileOwnerOnChain = new anchor.web3.PublicKey(fileDataResponse.file_data["owner-account-pubkey"]);
        if (!fileOwnerOnChain.equals(this.wallet.publicKey)) {
            return Promise.reject(new Error("Permission denied: Not file owner"));
        }
        const storageAccount = new anchor.web3.PublicKey(fileDataResponse.file_data["storage-account-pubkey"]);
        const hashSum = crypto_1.default.createHash("sha256");
        hashSum.update(Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer));
        const sha256Hash = hashSum.digest("hex");
        let size = new anchor.BN(fileBuffer.byteLength);
        try {
            const msg = Buffer.from(`Shadow Drive Signed Message:\n StorageAccount: ${key}\nFile to edit: ${data.name}\nNew file hash: ${sha256Hash}`);
            let msgSig;
            if (!this.wallet.signMessage) {
                msgSig = tweetnacl_1.default.sign.detached(msg, this.wallet.payer.secretKey);
            }
            else {
                msgSig = yield this.wallet.signMessage(msg);
            }
            const encodedMsg = bytes_1.bs58.encode(msgSig);
            form.append("message", encodedMsg);
            form.append("signer", this.wallet.publicKey.toString());
            form.append("storage_account", key.toString());
            const uploadResponse = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/edit`, {
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
exports.default = editFile;
//# sourceMappingURL=edit-file.js.map