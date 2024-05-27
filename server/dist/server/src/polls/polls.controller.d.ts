import { CreatePollDto, JoinPollDto } from './dtos';
import { PollsService } from './polls.service';
import { RequestWithAuth } from './types';
export declare class PollsController {
    private pollsService;
    constructor(pollsService: PollsService);
    create(createPollDto: CreatePollDto): Promise<{
        poll: import("shared").Poll;
        accessToken: string;
    }>;
    join(joinPollDto: JoinPollDto): Promise<{
        poll: import("shared").Poll;
        accessToken: string;
    }>;
    rejoin(request: RequestWithAuth): Promise<import("shared").Poll>;
}
