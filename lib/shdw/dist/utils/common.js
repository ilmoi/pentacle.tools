"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHDW_DRIVE_ENDPOINT = exports.emissions = exports.uploader = exports.tokenMint = exports.programAddress = exports.isBrowser = void 0;
const anchor_1 = require("@project-serum/anchor");
/**
 * Returns true if being run inside a web browser,
 * false if in a Node process
 */
exports.isBrowser = (typeof window !== "undefined" && !((_a = window.process) === null || _a === void 0 ? void 0 : _a.hasOwnProperty("type"))) ||
    process.env.SHDW_BROWSER;
exports.programAddress = new anchor_1.web3.PublicKey("2e1wdyNhUvE76y6yUCvah2KaviavMJYKoRun8acMRBZZ");
exports.tokenMint = new anchor_1.web3.PublicKey("SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y");
exports.uploader = new anchor_1.web3.PublicKey("972oJTFyjmVNsWM4GHEGPWUomAiJf2qrVotLtwnKmWem");
exports.emissions = new anchor_1.web3.PublicKey("SHDWRWMZ6kmRG9CvKFSD7kVcnUqXMtd3SaMrLvWscbj");
exports.SHDW_DRIVE_ENDPOINT = "https://shadow-storage.genesysgo.net";
//# sourceMappingURL=common.js.map