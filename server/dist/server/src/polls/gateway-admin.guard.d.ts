import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PollsService } from './polls.service';
export declare class GatewayAdminGuard implements CanActivate {
    private readonly pollsService;
    private readonly jwtService;
    private readonly logger;
    constructor(pollsService: PollsService, jwtService: JwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
