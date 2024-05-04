import { Logger } from '@nestjs/common';
import { OnGatewayInit ,WebSocketServer, WebSocketGateway , OnGatewayConnection , OnGatewayDisconnect } from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Socket , Namespace } from 'socket.io';

@WebSocketGateway({
    namespace: 'polls',
})
export class PollsGateway implements OnGatewayInit, OnGatewayConnection , OnGatewayDisconnect {
    private readonly logger = new Logger(PollsGateway.name);
    constructor(private readonly pollsService: PollsService){}

    @WebSocketServer() io: Namespace;
    
    afterInit(): void {
        this.logger.log(`Websocket Gateway initialized.`);
    }

    handleConnection(client: Socket) {
        const sockets = this.io.sockets;

        this.logger.log(`WS Client with id: ${client.id} connected!`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);

        this.io.emit('hello', `from ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const sockets = this.io.sockets;

        this.logger.log(`Disconnected socket id: ${client.id}`);
        this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    }

}