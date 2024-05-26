"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GatewayAdminGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const ws_exceptions_1 = require("../exceptions/ws-exceptions");
const polls_service_1 = require("./polls.service");
let GatewayAdminGuard = GatewayAdminGuard_1 = class GatewayAdminGuard {
    constructor(pollsService, jwtService) {
        this.pollsService = pollsService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(GatewayAdminGuard_1.name);
    }
    async canActivate(context) {
        const socket = context.switchToWs().getClient();
        const token = socket.handshake.auth.token || socket.handshake.headers['token'];
        if (!token) {
            this.logger.error('No authorization token provided');
            throw new ws_exceptions_1.WsUnauthorizedException('No token provided');
        }
        try {
            const payload = this.jwtService.verify(token);
            this.logger.debug(`Validating admin using token payload`, payload);
            const { userID, pollID } = payload;
            const poll = await this.pollsService.getPoll(pollID);
            if (userID !== poll.adminID) {
                throw new ws_exceptions_1.WsUnauthorizedException('Admin privileges required');
            }
            return true;
        }
        catch (_a) {
            throw new ws_exceptions_1.WsUnauthorizedException('Admin privileges required');
        }
    }
};
exports.GatewayAdminGuard = GatewayAdminGuard;
exports.GatewayAdminGuard = GatewayAdminGuard = GatewayAdminGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [polls_service_1.PollsService,
        jwt_1.JwtService])
], GatewayAdminGuard);
//# sourceMappingURL=gateway-admin.guard.js.map