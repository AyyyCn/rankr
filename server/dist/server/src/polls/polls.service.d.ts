import { JwtService } from '@nestjs/jwt';
import { Poll } from 'shared/poll-types';
import { PollsRepository } from './polls.repository';
import { AddNominationFields, AddParticipantFields, CreatePollFields, JoinPollFields, RejoinPollFields, SubmitRankingsFields } from './types';
export declare class PollsService {
    private readonly pollsRepository;
    private readonly jwtService;
    private readonly logger;
    constructor(pollsRepository: PollsRepository, jwtService: JwtService);
    createPoll(fields: CreatePollFields): Promise<{
        poll: Poll;
        accessToken: string;
    }>;
    joinPoll(fields: JoinPollFields): Promise<{
        poll: Poll;
        accessToken: string;
    }>;
    rejoinPoll(fields: RejoinPollFields): Promise<Poll>;
    addParticipant(addParticipant: AddParticipantFields): Promise<Poll>;
    removeParticipant(pollID: string, userID: string): Promise<Poll | void>;
    getPoll(pollID: string): Promise<Poll>;
    addNomination({ pollID, userID, text, }: AddNominationFields): Promise<Poll>;
    removeNomination(pollID: string, nominationID: string): Promise<Poll>;
    startPoll(pollID: string): Promise<Poll>;
    submitRankings(rankingsData: SubmitRankingsFields): Promise<Poll>;
    computeResults(pollID: string): Promise<Poll>;
    cancelPoll(pollID: string): Promise<void>;
}
