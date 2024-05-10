import { DynamicModule, FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
export declare const IORedisKey = "IORedis";
type RedisModuleOptions = {
    connectionOptions: RedisOptions;
    onClientReady?: (client: Redis) => void;
};
type RedisAsyncModuleOptions = {
    useFactory: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> & Pick<FactoryProvider, 'inject'>;
export declare class RedisModule {
    static registerAsync({ useFactory, imports, inject, }: RedisAsyncModuleOptions): Promise<DynamicModule>;
}
export {};
