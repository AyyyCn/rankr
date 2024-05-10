import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from './types';
import { NominationDto } from './dtos';
export declare class PollsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly pollsService;
    private readonly logger;
    constructor(pollsService: PollsService);
    io: Namespace;
    afterInit(): void;
    handleConnection(client: SocketWithAuth): Promise<void>;
    handleDisconnect(client: SocketWithAuth): Promise<void>;
    removeParticipant(id: string, client: SocketWithAuth): Promise<void>;
    nominate(nomination: NominationDto, client: SocketWithAuth): Promise<void>;
    removeNomination(nominationID: string, client: SocketWithAuth): Promise<void>;
    startVote(client: SocketWithAuth): Promise<void>;
    submitRankings(client: SocketWithAuth, rankings: string[]): Promise<void>;
    closePoll(client: SocketWithAuth): Promise<void>;
    cancelPoll(client: SocketWithAuth): Promise<void>;
}
