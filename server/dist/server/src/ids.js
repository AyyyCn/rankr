"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNominationID = exports.createUserID = exports.createPollID = void 0;
const nanoid_1 = require("nanoid");
exports.createPollID = (0, nanoid_1.customAlphabet)('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
const createUserID = () => (0, nanoid_1.nanoid)();
exports.createUserID = createUserID;
const createNominationID = () => (0, nanoid_1.nanoid)(8);
exports.createNominationID = createNominationID;
//# sourceMappingURL=ids.js.map