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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChunkLength = exports.sortByProperty = exports.chunks = exports.sendAndConfirm = exports.awaitTransactionSignatureConfirmation = exports.sleep = exports.bytesToHuman = exports.humanSizeToBytes = exports.getStakeAccount = exports.getStorageAccount = exports.getUserInfo = exports.getStorageConfigPDA = exports.findAssociatedTokenAddress = exports.getAnchorEnvironmet = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const idl_1 = require("./idl");
const common_1 = require("./common");
const spl_token_1 = require("@solana/spl-token");
const DEFAULT_TIMEOUT = 3 * 60 * 1000; // 3 minutes
/**
 *
 * Todo - support more than just anchor wallets?
 *
 * @param wallet
 * @param connection
 * @returns
 */
function getAnchorEnvironmet(wallet, connection) {
    //   const wallet = new anchor.Wallet(keypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    const program = new anchor.Program(idl_1.IDL, common_1.programAddress);
    return [program, provider];
}
exports.getAnchorEnvironmet = getAnchorEnvironmet;
// This helper function finds the ATA given a wallet + mint address
function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield anchor.web3.PublicKey.findProgramAddress([
            walletAddress.toBuffer(),
            spl_token_1.TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ], spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID))[0];
    });
}
exports.findAssociatedTokenAddress = findAssociatedTokenAddress;
function getStorageConfigPDA(program) {
    return __awaiter(this, void 0, void 0, function* () {
        return anchor.web3.PublicKey.findProgramAddress([Buffer.from("storage-config")], program.programId);
    });
}
exports.getStorageConfigPDA = getStorageConfigPDA;
function getUserInfo(program, key) {
    return __awaiter(this, void 0, void 0, function* () {
        return anchor.web3.PublicKey.findProgramAddress([Buffer.from("user-info"), key.toBytes()], program.programId);
    });
}
exports.getUserInfo = getUserInfo;
function getStorageAccount(program, key, accountSeed) {
    return __awaiter(this, void 0, void 0, function* () {
        return anchor.web3.PublicKey.findProgramAddress([
            Buffer.from("storage-account"),
            key.toBytes(),
            accountSeed.toTwos(2).toArrayLike(Buffer, "le", 4),
        ], program.programId);
    });
}
exports.getStorageAccount = getStorageAccount;
function getStakeAccount(program, storageAccount) {
    return __awaiter(this, void 0, void 0, function* () {
        return anchor.web3.PublicKey.findProgramAddress([Buffer.from("stake-account"), storageAccount.toBytes()], program.programId);
    });
}
exports.getStakeAccount = getStakeAccount;
function humanSizeToBytes(input) {
    const UNITS = ["kb", "mb", "gb"];
    let chunk_size = 0;
    let humanReadable = input.toLowerCase();
    let inputNumber = Number(humanReadable.slice(0, humanReadable.length - 2));
    let inputDescriptor = humanReadable.slice(humanReadable.length - 2, humanReadable.length);
    if (!UNITS.includes(inputDescriptor) || !inputNumber) {
        return false;
    }
    switch (inputDescriptor) {
        case "kb":
            chunk_size = 1024;
            break;
        case "mb":
            chunk_size = 1048576;
            break;
        case "gb":
            chunk_size = 1073741824;
            break;
        default:
            break;
    }
    return inputNumber * chunk_size;
}
exports.humanSizeToBytes = humanSizeToBytes;
function bytesToHuman(bytes, si = false, dp = 1) {
    const thresh = si ? 1024 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }
    const units = si
        ? ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = Math.pow(10, dp);
    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1);
    return bytes.toFixed(dp) + " " + units[u];
}
exports.bytesToHuman = bytesToHuman;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function getUnixTime() {
    return new Date().valueOf() / 1000;
}
const awaitTransactionSignatureConfirmation = (txid, timeout, connection, commitment = "recent", queryStatus = false) => __awaiter(void 0, void 0, void 0, function* () {
    let done = false;
    let status = {
        slot: 0,
        confirmations: 0,
        err: null,
    };
    let subId = 0;
    status = yield new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let timer = setTimeout(() => {
            if (done) {
                return;
            }
            done = true;
            console.log("Rejecting for timeout...");
            reject({ timeout: true });
        }, timeout);
        try {
            console.log("COMMIMENT", commitment);
            subId = connection.onSignature(txid, (result, context) => {
                done = true;
                status = {
                    err: result.err,
                    slot: context.slot,
                    confirmations: 0,
                };
                if (result.err) {
                    console.log("Rejected via websocket", result.err);
                    reject(status);
                }
                else {
                    console.log("Resolved via websocket", result);
                    resolve(status);
                }
            }, commitment);
        }
        catch (e) {
            done = true;
            console.error("WS error in setup", txid, e);
        }
        while (!done && queryStatus) {
            // eslint-disable-next-line no-loop-func
            (() => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const signatureStatuses = yield connection.getSignatureStatuses([
                        txid,
                    ]);
                    status = signatureStatuses && signatureStatuses.value[0];
                    if (!done) {
                        if (!status) {
                            console.log("REST null result for", txid, status);
                            if (timer === null) {
                                timer = setTimeout(() => {
                                    if (done) {
                                        return;
                                    }
                                    done = true;
                                    console.log("Rejecting for timeout...");
                                    reject({ timeout: true });
                                }, timeout);
                            }
                        }
                        else if (status.err) {
                            console.log("REST error for", txid, status);
                            done = true;
                            reject(status.err);
                        }
                        else if (!status.confirmations && !status.confirmationStatus) {
                            console.log("REST no confirmations for", txid, status);
                        }
                        else {
                            console.log("REST confirmation for", txid, status);
                            if (timer !== null) {
                                clearTimeout(timer);
                                timer = null;
                            }
                            if (!status.confirmationStatus ||
                                status.confirmationStatus == commitment) {
                                done = true;
                                resolve(status);
                            }
                        }
                    }
                }
                catch (e) {
                    if (!done) {
                        console.log("REST connection error: txid", txid, e);
                    }
                }
            }))();
            yield sleep(2000);
        }
    }));
    done = true;
    console.log("Returning status ", status);
    return status;
});
exports.awaitTransactionSignatureConfirmation = awaitTransactionSignatureConfirmation;
function simulateTransaction(connection, transaction, commitment) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        transaction.recentBlockhash = yield connection._recentBlockhash(
        // @ts-ignore
        connection._disableBlockhashCaching);
        const signData = transaction.serializeMessage();
        // @ts-ignore
        const wireTransaction = transaction._serialize(signData);
        const encodedTransaction = wireTransaction.toString("base64");
        const config = { encoding: "base64", commitment };
        const args = [encodedTransaction, config];
        // @ts-ignore
        const res = yield connection._rpcRequest("simulateTransaction", args);
        if (res.error) {
            throw new Error("failed to simulate transaction: " + res.error.message);
        }
        return res.result;
    });
}
/*
    Original comment from Strata:
    -----------------------------------------------
    A validator has up to 120s to accept the transaction and send it into a block.
    If it doesn’t happen within that timeframe, your transaction is dropped and you’ll need
    to send the transaction again. You can get the transaction signature and periodically
    Ping the network for that transaction signature. If you never get anything back,
    that means it’s definitely been dropped. If you do get a response back, you can keep pinging
    until it’s gone to a confirmed status to move on.
  */
function sendAndConfirm(connection, txn, sendOptions, commitment, timeout = DEFAULT_TIMEOUT) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let done = false;
            let slot = 0;
            const txid = yield connection.sendRawTransaction(txn, sendOptions);
            const startTime = getUnixTime();
            try {
                const confirmation = yield (0, exports.awaitTransactionSignatureConfirmation)(txid, timeout, connection, commitment, true);
                if (!confirmation)
                    throw new Error("Timed out awaiting confirmation on transaction");
                if (confirmation.err) {
                    const tx = yield connection.getTransaction(txid);
                    console.error((_b = (_a = tx === null || tx === void 0 ? void 0 : tx.meta) === null || _a === void 0 ? void 0 : _a.logMessages) === null || _b === void 0 ? void 0 : _b.join("\n"));
                    console.error(confirmation.err);
                    throw new Error("Transaction failed: Custom instruction error");
                }
                slot = (confirmation === null || confirmation === void 0 ? void 0 : confirmation.slot) || 0;
            }
            catch (err) {
                console.error("Timeout Error caught", err);
                if (err.timeout) {
                    throw new Error("Timed out awaiting confirmation on transaction");
                }
                let simulateResult = null;
                try {
                    simulateResult = (yield simulateTransaction(connection, anchor.web3.Transaction.from(txn), "single")).value;
                }
                catch (e) { }
                if (simulateResult && simulateResult.err) {
                    if (simulateResult.logs) {
                        console.error(simulateResult.logs.join("\n"));
                    }
                }
                if (err.err) {
                    throw err.err;
                }
                throw err;
            }
            finally {
                done = true;
            }
            console.log("Latency", txid, getUnixTime() - startTime);
            return { txid };
        }
        catch (e) {
            throw new Error(e);
        }
    });
}
exports.sendAndConfirm = sendAndConfirm;
function chunks(array, size) {
    return Array.apply(0, new Array(Math.ceil(array.length / size))).map((_, index) => array.slice(index * size, (index + 1) * size));
}
exports.chunks = chunks;
function sortByProperty(property) {
    return function (a, b) {
        if (a[property].toNumber() > b[property].toNumber())
            return 1;
        else if (a[property].toNumber() < b[property].toNumber())
            return -1;
        return 0;
    };
}
exports.sortByProperty = sortByProperty;
function getChunkLength(array1, array2) {
    let starting = array1.length;
    if (array2.length) {
        return array2.reduce((total, next) => (total += next.length), starting);
    }
    return starting;
}
exports.getChunkLength = getChunkLength;
//# sourceMappingURL=helpers.js.map