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

    handleConnection(client: SocketWithAuth) {
        const sockets = this.io.sockets;
        this.logger.debug(
            `Socket connected with userID: ${client.userID}, pollID: ${client.pollID}, and name: "${client.name}"`,
        );


        this.logger.log(`WS Client with id: ${client.id} connected!`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);

        this.io.emit('hello', `from ${client.id}`);
    }

    handleDisconnect(client: SocketWithAuth) {
        const sockets = this.io.sockets;
        this.logger.debug(
            `Socket connected with userID: ${client.userID}, pollID: ${client.pollID}, and name: "${client.name}"`,
        );
        this.logger.log(`Disconnected socket id: ${client.id}`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    }

    @SubscribeMessage('test')
    async test() {
        throw new BadRequestException('error test');
    }
}