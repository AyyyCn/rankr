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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PollsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollsGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const ws_catch_all_filter_1 = require("../exceptions/ws-catch-all-filter");
const polls_service_1 = require("./polls.service");
const socket_io_1 = require("socket.io");
const gateway_admin_guard_1 = require("./gateway-admin.guard");
const dtos_1 = require("./dtos");
let PollsGateway = PollsGateway_1 = class PollsGateway {
    constructor(pollsService) {
        this.pollsService = pollsService;
        this.logger = new common_1.Logger(PollsGateway_1.name);
    }
    afterInit() {
        this.logger.log(`Websocket Gateway initialized.`);
    }
    async handleConnection(client) {
        var _a, _b, _c;
        const sockets = this.io.sockets;
        this.logger.debug(`Socket connected with userID: ${client.userID}, pollID: ${client.pollID}, and name: "${client.name}"`);
        this.logger.log(`WS Client with id: ${client.id} connected!`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);
        const roomName = client.pollID;
        await client.join(roomName);
        const connectedClients = (_c = (_b = (_a = this.io.adapter.rooms) === null || _a === void 0 ? void 0 : _a.get(roomName)) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0;
        this.logger.debug(`userID: ${client.userID} joined room with name: ${roomName}`);
        this.logger.debug(`Total clients connected to room '${roomName}': ${connectedClients}`);
        const updatedPoll = await this.pollsService.addParticipant({
            pollID: client.pollID,
            userID: client.userID,
            name: client.name,
        });
        this.io.to(roomName).emit('poll_updated', updatedPoll);
    }
    async handleDisconnect(client) {
        var _a, _b, _c;
        const sockets = this.io.sockets;
        const { pollID, userID } = client;
        const updatedPoll = await this.pollsService.removeParticipant(pollID, userID);
        const roomName = client.pollID;
        const clientCount = (_c = (_b = (_a = this.io.adapter.rooms) === null || _a === void 0 ? void 0 : _a.get(roomName)) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0;
        this.logger.log(`Disconnected socket id: ${client.id}`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);
        this.logger.debug(`Total clients connected to room '${roomName}': ${clientCount}`);
        if (updatedPoll) {
            this.io.to(pollID).emit('poll_updated', updatedPoll);
        }
    }
    async removeParticipant(id, client) {
        this.logger.debug(`Attempting to remove participant ${id} from poll ${client.pollID}`);
        const updatedPoll = await this.pollsService.removeParticipant(client.pollID, id);
        if (updatedPoll) {
            this.io.to(client.pollID).emit('poll_updated', updatedPoll);
        }
    }
    async nominate(nomination, client) {
        this.logger.debug(`Attempting to add nomination for user ${client.userID} to poll ${client.pollID}\n${nomination.text}`);
        const updatedPoll = await this.pollsService.addNomination({
            pollID: client.pollID,
            userID: client.userID,
            text: nomination.text,
        });
        this.io.to(client.pollID).emit('poll_updated', updatedPoll);
    }
    async removeNomination(nominationID, client) {
        this.logger.debug(`Attempting to remove nomination ${nominationID} from poll ${client.pollID}`);
        const updatedPoll = await this.pollsService.removeNomination(client.pollID, nominationID);
        this.io.to(client.pollID).emit('poll_updated', updatedPoll);
    }
    async startVote(client) {
        this.logger.debug(`Attempting to start voting for poll: ${client.pollID}`);
        const updatedPoll = await this.pollsService.startPoll(client.pollID);
        this.io.to(client.pollID).emit('poll_updated', updatedPoll);
    }
    async submitRankings(client, rankings) {
        this.logger.debug(`Submitting votes for user: ${client.userID} belonging to pollID: "${client.pollID}"`);
        const updatedPoll = await this.pollsService.submitRankings({
            pollID: client.pollID,
            userID: client.userID,
            rankings,
        });
        this.io.to(client.pollID).emit('poll_updated', updatedPoll);
    }
    async closePoll(client) {
        this.logger.debug(`Closing poll: ${client.pollID} and computing results`);
        const updatedPoll = await this.pollsService.computeResults(client.pollID);
        this.io.to(client.pollID).emit('poll_updated', updatedPoll);
    }
    async cancelPoll(client) {
        this.logger.debug(`Cancelling poll with id: "${client.pollID}"`);
        await this.pollsService.cancelPoll(client.pollID);
        this.io.to(client.pollID).emit('poll_cancelled');
    }
};
exports.PollsGateway = PollsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Namespace)
], PollsGateway.prototype, "io", void 0);
__decorate([
    (0, common_1.UseGuards)(gateway_admin_guard_1.GatewayAdminGuard),
    (0, websockets_1.SubscribeMessage)('remove_participant'),
    __param(0, (0, websockets_1.MessageBody)('id')),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "removeParticipant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('nominate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.NominationDto, Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "nominate", null);
__decorate([
    (0, common_1.UseGuards)(gateway_admin_guard_1.GatewayAdminGuard),
    (0, websockets_1.SubscribeMessage)('remove_nomination'),
    __param(0, (0, websockets_1.MessageBody)('id')),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "removeNomination", null);
__decorate([
    (0, common_1.UseGuards)(gateway_admin_guard_1.GatewayAdminGuard),
    (0, websockets_1.SubscribeMessage)('start_vote'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "startVote", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('submit_rankings'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('rankings')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "submitRankings", null);
__decorate([
    (0, common_1.UseGuards)(gateway_admin_guard_1.GatewayAdminGuard),
    (0, websockets_1.SubscribeMessage)('close_poll'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "closePoll", null);
__decorate([
    (0, common_1.UseGuards)(gateway_admin_guard_1.GatewayAdminGuard),
    (0, websockets_1.SubscribeMessage)('cancel_poll'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "cancelPoll", null);
exports.PollsGateway = PollsGateway = PollsGateway_1 = __decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.UseFilters)(new ws_catch_all_filter_1.WsCatchAllFilter()),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'polls',
    }),
    __metadata("design:paramtypes", [polls_service_1.PollsService])
], PollsGateway);
//# sourceMappingURL=polls.gateway.js.map