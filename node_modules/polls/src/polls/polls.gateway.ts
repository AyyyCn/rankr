import {
    BadRequestException,
    Logger,
    UseFilters,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import {
    OnGatewayInit, WebSocketServer, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { WsCatchAllFilter } from 'src/exceptions/ws-catch-all-filter';
import { PollsService } from './polls.service';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from './types';
@UsePipes(new ValidationPipe())
 @UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
    namespace: 'polls',
})
export class PollsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(PollsGateway.name);
    constructor(private readonly pollsService: PollsService) { }
    
    @WebSocketServer() io: Namespace;
    afterInit(): void {
        this.logger.log(`Websocket Gateway initialized.`);
    }

    async handleConnection(client: SocketWithAuth) {
        const sockets = this.io.sockets;
        this.logger.debug(
            `Socket connected with userID: ${client.userID}, pollID: ${client.pollID}, and name: "${client.name}"`,
        );


        this.logger.log(`WS Client with id: ${client.id} connected!`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);

        const roomName = client.pollID;
        await client.join(roomName);
    
        const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    
        this.logger.debug(
          `userID: ${client.userID} joined room with name: ${roomName}`,
        );
        this.logger.debug(
          `Total clients connected to room '${roomName}': ${connectedClients}`,
        );
    
        const updatedPoll = await this.pollsService.addParticipant({
          pollID: client.pollID,
          userID: client.userID,
          name: client.name,
        });
    
        this.io.to(roomName).emit('poll_updated', updatedPoll);
      }
        

    async handleDisconnect(client: SocketWithAuth) {
        const sockets = this.io.sockets;
        const { pollID, userID } = client;
        const updatedPoll = await this.pollsService.removeParticipant(
          pollID,
          userID,
        );
        const roomName = client.pollID;
        const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
        this.logger.log(`Disconnected socket id: ${client.id}`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);
        this.logger.debug(
            `Total clients connected to room '${roomName}': ${clientCount}`,
          );
          if (updatedPoll) {
            this.io.to(pollID).emit('poll_updated', updatedPoll);
          }
    }

    @SubscribeMessage('test')
    async test() {
        throw new BadRequestException('error test');
    }
}