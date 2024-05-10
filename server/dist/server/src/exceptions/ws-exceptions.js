"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsUnknownException = exports.WsUnauthorizedException = exports.WsBadRequestException = exports.WsTypeException = void 0;
const websockets_1 = require("@nestjs/websockets");
class WsTypeException extends websockets_1.WsException {
    constructor(type, message) {
        const error = {
            type,
            message,
        };
        super(error);
        this.type = type;
    }
}
exports.WsTypeException = WsTypeException;
class WsBadRequestException extends WsTypeException {
    constructor(message) {
        super('BadRequest', message);
    }
}
exports.WsBadRequestException = WsBadRequestException;
class WsUnauthorizedException extends WsTypeException {
    constructor(message) {
        super('Unauthorized', message);
    }
}
exports.WsUnauthorizedException = WsUnauthorizedException;
class WsUnknownException extends WsTypeException {
    constructor(message) {
        super('Unknown', message);
    }
}
exports.WsUnknownException = WsUnknownException;
//# sourceMappingURL=ws-exceptions.js.map