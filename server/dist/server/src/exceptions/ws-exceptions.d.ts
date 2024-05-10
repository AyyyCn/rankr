import { WsException } from '@nestjs/websockets';
type WsExceptionType = 'BadRequest' | 'Unauthorized' | 'Unknown';
export declare class WsTypeException extends WsException {
    readonly type: WsExceptionType;
    constructor(type: WsExceptionType, message: string | unknown);
}
export declare class WsBadRequestException extends WsTypeException {
    constructor(message: string | unknown);
}
export declare class WsUnauthorizedException extends WsTypeException {
    constructor(message: string | unknown);
}
export declare class WsUnknownException extends WsTypeException {
    constructor(message: string | unknown);
}
export {};
