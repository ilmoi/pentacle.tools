"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = exports.redeemRent = exports.uploadMultipleFiles = exports.uploadFile = exports.cancelDeleteStorageAccount = exports.cancelDeleteFile = exports.reduceStorage = exports.makeStorageImmutable = exports.listObjects = exports.getStorageAccs = exports.getStorageAcc = exports.editFile = exports.deleteStorageAccount = exports.deleteFile = exports.createStorageAccount = exports.claimStake = exports.addStorage = void 0;
const add_storage_1 = __importDefault(require("./add-storage"));
exports.addStorage = add_storage_1.default;
const claim_stake_1 = __importDefault(require("./claim-stake"));
exports.claimStake = claim_stake_1.default;
const create_storage_account_1 = __importDefault(require("./create-storage-account"));
exports.createStorageAccount = create_storage_account_1.default;
const delete_file_1 = __importDefault(require("./delete-file"));
exports.deleteFile = delete_file_1.default;
const delete_storage_account_1 = __importDefault(require("./delete-storage-account"));
exports.deleteStorageAccount = delete_storage_account_1.default;
const edit_file_1 = __importDefault(require("./edit-file"));
exports.editFile = edit_file_1.default;
const get_storage_account_1 = __importDefault(require("./get-storage-account"));
exports.getStorageAcc = get_storage_account_1.default;
const get_storage_accounts_1 = __importDefault(require("./get-storage-accounts"));
exports.getStorageAccs = get_storage_accounts_1.default;
const list_objects_1 = __importDefault(require("./list-objects"));
exports.listObjects = list_objects_1.default;
const make_storage_immutable_1 = __importDefault(require("./make-storage-immutable"));
exports.makeStorageImmutable = make_storage_immutable_1.default;
const reduce_storage_1 = __importDefault(require("./reduce-storage"));
exports.reduceStorage = reduce_storage_1.default;
const cancel_delete_file_1 = __importDefault(require("./cancel-delete-file"));
exports.cancelDeleteFile = cancel_delete_file_1.default;
const cancel_storage_account_1 = __importDefault(require("./cancel-storage-account"));
exports.cancelDeleteStorageAccount = cancel_storage_account_1.default;
const upload_file_1 = __importDefault(require("./upload-file"));
exports.uploadFile = upload_file_1.default;
const upload_multiple_files_1 = __importDefault(require("./upload-multiple-files"));
exports.uploadMultipleFiles = upload_multiple_files_1.default;
const redeem_rent_1 = __importDefault(require("./redeem-rent"));
exports.redeemRent = redeem_rent_1.default;
const migrate_1 = __importDefault(require("./migrate"));
exports.migrate = migrate_1.default;
//# sourceMappingURL=index.js.map