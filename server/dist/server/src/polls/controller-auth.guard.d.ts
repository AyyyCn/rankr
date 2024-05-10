import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
export declare class ControllerAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly logger;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
