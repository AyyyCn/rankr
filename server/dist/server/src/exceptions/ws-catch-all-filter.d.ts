import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class WsCatchAllFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost): void;
}
