/// <reference types="node" />
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ShadowDriveUserStaking } from "./idl";
/**
 *
 * Todo - support more than just anchor wallets?
 *
 * @param wallet
 * @param connection
 * @returns
 */
export declare function getAnchorEnvironmet(wallet: anchor.Wallet, connection: anchor.web3.Connection): [Program<ShadowDriveUserStaking>, anchor.Provider];
export declare function findAssociatedTokenAddress(walletAddress: anchor.web3.PublicKey, tokenMintAddress: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey>;
export declare function getStorageConfigPDA(program: Program<ShadowDriveUserStaking>): Promise<[anchor.web3.PublicKey, number]>;
export declare function getUserInfo(program: Program<ShadowDriveUserStaking>, key: anchor.web3.PublicKey): Promise<[anchor.web3.PublicKey, number]>;
export declare function getStorageAccount(program: Program<ShadowDriveUserStaking>, key: anchor.web3.PublicKey, accountSeed: anchor.BN): Promise<[anchor.web3.PublicKey, number]>;
export declare function getStakeAccount(program: Program<ShadowDriveUserStaking>, storageAccount: anchor.web3.PublicKey): Promise<[anchor.web3.PublicKey, number]>;
export declare function humanSizeToBytes(input: string): number | boolean;
export declare function bytesToHuman(bytes: any, si?: boolean, dp?: number): string;
export declare function sleep(ms: number): Promise<any>;
export declare const awaitTransactionSignatureConfirmation: (txid: anchor.web3.TransactionSignature, timeout: number, connection: anchor.web3.Connection, commitment?: anchor.web3.Commitment, queryStatus?: boolean) => Promise<anchor.web3.SignatureStatus | null | void>;
export declare function sendAndConfirm(connection: anchor.web3.Connection, txn: Buffer, sendOptions: anchor.web3.SendOptions, commitment: anchor.web3.Commitment, timeout?: number): Promise<{
    txid: string;
}>;
export declare function chunks(array: any, size: any): any;
export declare function sortByProperty(property: any): (a: any, b: any) => 0 | 1 | -1;
export declare function getChunkLength(array1: any[], array2: any[]): any;
//# sourceMappingURL=helpers.d.ts.map