export declare class CreatePollDto {
    topic: string;
    votesPerVoter: number;
    name: string;
}
export declare class JoinPollDto {
    pollID: string;
    name: string;
}
export declare class NominationDto {
    text: string;
}
