"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOAdapter = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class SocketIOAdapter extends platform_socket_io_1.IoAdapter {
    constructor(app, configService) {
        super(app);
        this.app = app;
        this.configService = configService;
        this.logger = new common_1.Logger(SocketIOAdapter.name);
    }
    createIOServer(port, options) {
        const clientPort = parseInt(this.configService.get('CLIENT_PORT'));
        const cors = {
            origin: [
                `http://localhost:${clientPort}`,
                new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
            ],
        };
        this.logger.log('Configuring SocketIO server with custom CORS options', { cors });
        const optionsWithCORS = {
            ...options,
            cors,
        };
        const jwtService = this.app.get(jwt_1.JwtService);
        const server = super.createIOServer(port, optionsWithCORS);
        server.of('polls').use(createTokenMiddleware(jwtService, this.logger));
        return server;
    }
}
exports.SocketIOAdapter = SocketIOAdapter;
const createTokenMiddleware = (jwtService, logger) => (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];
    logger.debug(`Validating auth token before connection: ${token}`);
    try {
        const payload = jwtService.verify(token);
        socket.userID = payload.sub;
        socket.pollID = payload.pollID;
        socket.name = payload.name;
        next();
    }
    catch {
        next(new Error('FORBIDDEN'));
    }
};
//# sourceMappingURL=socket-io-adapter.js.map