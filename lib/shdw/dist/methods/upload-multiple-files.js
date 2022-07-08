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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@project-serum/anchor"));
const common_1 = require("../utils/common");
const crypto_1 = __importDefault(require("crypto"));
const form_data_1 = __importDefault(require("form-data"));
const helpers_1 = require("../utils/helpers");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const rxjs_1 = require("rxjs");
/**
 *
 * @param {anchor.web3.PublicKey} key - Storage account PublicKey to upload the files to.
 * @param {FileList | ShadowFile[]} data[] - Array of Files or ShadowFile objects to be uploaded
 * @returns {ShadowBatchUploadResponse[]} - File names, locations and transaction signatures for uploaded files.
 */
function uploadMultipleFiles(key, data, concurrent = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileData = [];
        const fileErrors = [];
        let existingUploadJSON = [];
        /**
         *
         * Prepare files for uploading.
         */
        if (!common_1.isBrowser) {
            data = data;
            data.forEach((shdwFile) => __awaiter(this, void 0, void 0, function* () {
                let form = new form_data_1.default();
                let file = shdwFile.file;
                form.append("file", file, shdwFile.name);
                let fileBuffer = form.getBuffer();
                if (fileBuffer.byteLength > 1073741824 * 1) {
                    fileErrors.push({
                        file: file,
                        erorr: "Exceeds the 1GB limit.",
                    });
                }
                const url = encodeURI(`https://shdw-drive.genesysgo.net/${key.toString()}/${shdwFile.name}`);
                let size = new anchor.BN(fileBuffer.byteLength);
                fileData.push({
                    name: shdwFile.name,
                    buffer: fileBuffer,
                    file: file,
                    form: form,
                    size: size,
                    url: url,
                });
            }));
        }
        else {
            data = data;
            for (const shdwFile of data) {
                let file = shdwFile;
                let form = new FormData();
                form.append("file", file, shdwFile.name);
                let fileBuffer = Buffer.from(new Uint8Array(yield file.arrayBuffer()));
                if (fileBuffer.byteLength > 1073741824 * 1) {
                    fileErrors.push({
                        file: file,
                        erorr: "Exceeds the 1GB limit.",
                    });
                }
                const url = encodeURI(`https://shdw-drive.genesysgo.net/${key.toString()}/${shdwFile.name}`);
                let size = new anchor.BN(fileBuffer.byteLength);
                fileData.push({
                    name: shdwFile.name,
                    buffer: fileBuffer,
                    file: file,
                    form: form,
                    size: size,
                    url: url,
                });
            }
        }
        if (fileErrors.length) {
            return Promise.reject(fileErrors);
        }
        if (!this.userInfo) {
            return Promise.reject("You have not created a storage account on Shadow Drive yet. Please see the 'create-storage-account' command to get started.");
        }
        let allObjectsRequest = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/list-objects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ storageAccount: key.toString() }),
        });
        if (!allObjectsRequest.status) {
            return Promise.reject(new Error(`Server response status code: ${allObjectsRequest.status} \n
        			Server response status message: ${(yield allObjectsRequest.json()).error}`));
        }
        /*
          Note: Currently if there are no objects stored in an account the API will throw a 500 http error.
      
          Providing a false negative status and preventing to upload multiple files on new accounts.
      
          The best way to solve this would be to directly return an empty keys array from the API.
      
          For now we'll need to handle this from here by initializing the objects ourselves.
        */
        let allObjects = { keys: [] };
        let existingFiles = [];
        // Only if successful, we assign the objects coming from the response.
        if (allObjectsRequest.status === 200)
            allObjects = (yield allObjectsRequest.json());
        fileData = fileData.filter((item) => {
            if (!allObjects.keys.includes(item.name)) {
                return true;
            }
            else {
                existingFiles.push({
                    fileName: item.name,
                    status: "Not uploaded: File already exists.",
                    location: item.url,
                });
                return false;
            }
        });
        const allFileNames = fileData.map((file) => file.name);
        const hashSum = crypto_1.default.createHash("sha256");
        hashSum.update(allFileNames.toString());
        const fileNamesHashed = hashSum.digest("hex");
        let encodedMsg;
        try {
            const msg = new TextEncoder().encode(`Shadow Drive Signed Message:\nStorage Account: ${key}\nUpload files with hash: ${fileNamesHashed}`);
            let msgSig;
            if (!this.wallet.signMessage) {
                msgSig = tweetnacl_1.default.sign.detached(msg, this.wallet.payer.secretKey);
            }
            else {
                msgSig = yield this.wallet.signMessage(msg);
            }
            encodedMsg = bytes_1.bs58.encode(msgSig);
        }
        catch (e) {
            console.log("Could not hash file names", e);
            return Promise.reject(new Error(e));
        }
        let chunks = [];
        let indivChunk = [];
        for (let chunkIdx = 0; chunkIdx < fileData.length; chunkIdx++) {
            if (indivChunk.length === 0) {
                indivChunk.push(chunkIdx);
                // Handle when a fresh individual chunk is equal to the file data's length
                let allChunksSum = (0, helpers_1.getChunkLength)(indivChunk, chunks);
                if (allChunksSum === fileData.length) {
                    chunks.push(indivChunk);
                    continue;
                }
                continue;
            }
            let fileNames = indivChunk.map((c) => fileData[c].name);
            const namesLength = Buffer.byteLength(Buffer.from(fileNames.join()));
            const currentNameBufferLength = Buffer.byteLength(Buffer.from(fileData[chunkIdx].name));
            if (indivChunk.length < 5 &&
                namesLength < 154 &&
                currentNameBufferLength + namesLength < 154) {
                indivChunk.push(chunkIdx);
                if (chunkIdx == fileData.length - 1) {
                    chunks.push(indivChunk);
                    indivChunk = [];
                }
            }
            else {
                chunks.push(indivChunk);
                indivChunk = [chunkIdx];
                let allChunksSum = (0, helpers_1.getChunkLength)(indivChunk, chunks);
                if (allChunksSum === fileData.length) {
                    chunks.push(indivChunk);
                    continue;
                }
            }
        }
        const appendFileToItem = (item) => {
            const { name, size, buffer } = item, props = __rest(item, ["name", "size", "buffer"]);
            let data = buffer;
            const hashSum = crypto_1.default.createHash("sha256");
            hashSum.update(data);
            const sha256Hash = hashSum.digest("hex");
            return Object.assign({ sha256Hash,
                name,
                size,
                buffer }, props);
        };
        return new Promise((resolve) => {
            (0, rxjs_1.from)(chunks)
                .pipe((0, rxjs_1.map)((indivChunk) => {
                return indivChunk.map((index) => appendFileToItem(fileData[index]));
            }), (0, rxjs_1.mergeMap)((items) => __awaiter(this, void 0, void 0, function* () {
                let fd;
                if (!common_1.isBrowser) {
                    fd = new form_data_1.default();
                }
                else {
                    fd = new FormData();
                }
                for (const item of items) {
                    let file;
                    if (!common_1.isBrowser) {
                        file = item.file;
                    }
                    else {
                        file = item.file;
                    }
                    fd.append("file", file, item.name);
                }
                fd.append("message", encodedMsg);
                fd.append("storage_account", key.toString());
                fd.append("signer", this.wallet.publicKey.toString());
                fd.append("fileNames", allFileNames.toString());
                const response = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/upload`, {
                    method: "POST",
                    //@ts-ignore
                    body: fd,
                });
                if (!response.ok) {
                    const error = (yield response.json()).error;
                    return items.map((item) => ({
                        fileName: item.fileName,
                        status: `Not uploaded: ${error}`,
                        location: null,
                    }));
                }
                else {
                    const responseJson = yield response.json();
                    if (responseJson.upload_errors.length) {
                        // TODO add type here
                        responseJson.upload_errors.map((error) => {
                            existingUploadJSON.push({
                                fileName: error.file,
                                status: `Not uploaded: ${error.error}`,
                                location: null,
                            });
                        });
                    }
                    return items.map((item) => ({
                        fileName: item.fileName,
                        status: "Uploaded.",
                        location: item.url,
                    }));
                }
            }), concurrent), 
            // zip them up into a flat array once all are done to get full result list
            (0, rxjs_1.toArray)(), (0, rxjs_1.map)((res) => res.flat()))
                .subscribe((res) => resolve(res));
        });
    });
}
exports.default = uploadMultipleFiles;
//# sourceMappingURL=upload-multiple-files.js.map