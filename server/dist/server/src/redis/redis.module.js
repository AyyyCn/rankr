"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = exports.IORedisKey = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
exports.IORedisKey = 'IORedis';
let RedisModule = RedisModule_1 = class RedisModule {
    static async registerAsync({ useFactory, imports, inject, }) {
        const redisProvider = {
            provide: exports.IORedisKey,
            useFactory: async (...args) => {
                const { connectionOptions, onClientReady } = await useFactory(...args);
                const client = await new ioredis_1.default(connectionOptions);
                onClientReady(client);
                return client;
            },
            inject,
        };
        return {
            module: RedisModule_1,
            imports,
            providers: [redisProvider],
            exports: [redisProvider],
        };
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = RedisModule_1 = __decorate([
    (0, common_1.Module)({})
], RedisModule);
//# sourceMappingURL=redis.module.js.map