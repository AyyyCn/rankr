"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PollsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollsRepository = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_module_1 = require("../redis/redis.module");
let PollsRepository = PollsRepository_1 = class PollsRepository {
    configService;
    redisClient;
    ttl;
    logger = new common_1.Logger(PollsRepository_1.name);
    constructor(configService, redisClient) {
        this.configService = configService;
        this.redisClient = redisClient;
        this.ttl = this.configService.get('POLL_DURATION') || 7200;
    }
    async createPoll({ votesPerVoter, topic, pollID, userID }) {
        const initialPoll = {
            id: pollID,
            topic,
            votesPerVoter,
            participants: {},
            nominations: {},
            rankings: {},
            results: [],
            adminID: userID,
            hasStarted: false,
        };
        this.logger.log(`Creating new poll: ${JSON.stringify(initialPoll, null, 2)} with TTL ${this.ttl}`);
        const key = `polls:${pollID}`;
        try {
            await this.redisClient.multi()
                .set(key, JSON.stringify(initialPoll))
                .expire(key, this.ttl)
                .exec();
            return initialPoll;
        }
        catch (e) {
            this.logger.error(`Failed to add poll to Redis: ${e.message}`, e);
            throw new common_1.InternalServerErrorException(`Failed to add poll to Redis: ${e.message}`);
        }
    }
    async getPoll(pollID) {
        this.logger.log(`Attempting to get poll with: ${pollID}`);
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            this.logger.verbose(currentPoll);
            return JSON.parse(currentPoll);
        }
        catch (e) {
            this.logger.error(`Failed to get pollID ${pollID}`, e);
            throw new common_1.InternalServerErrorException(`Failed to get pollID ${pollID}`);
        }
    }
    async addParticipant({ pollID, userID, name }) {
        this.logger.log(`Attempting to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`);
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            const poll = JSON.parse(currentPoll);
            poll.participants = poll.participants || {};
            poll.participants[userID] = name;
            await this.redisClient.set(key, JSON.stringify(poll));
            return poll;
        }
        catch (e) {
            this.logger.error(`Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`, e);
            throw new common_1.InternalServerErrorException(`Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`);
        }
    }
    async removeParticipant(pollID, userID) {
        this.logger.log(`Removing userID: ${userID} from poll: ${pollID}`);
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            const poll = JSON.parse(currentPoll);
            delete poll.participants[userID];
            await this.redisClient.set(key, JSON.stringify(poll));
            return poll;
        }
        catch (e) {
            this.logger.error(`Failed to remove userID: ${userID} from poll: ${pollID}`, e);
            throw new common_1.InternalServerErrorException('Failed to remove participant');
        }
    }
    async addNomination({ pollID, nominationID, nomination }) {
        this.logger.log(`Attempting to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`);
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            const poll = JSON.parse(currentPoll);
            poll.nominations = poll.nominations || {};
            poll.nominations[nominationID] = nomination;
            await this.redisClient.set(key, JSON.stringify(poll));
            return poll;
        }
        catch (e) {
            this.logger.error(`Failed to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`, e);
            throw new common_1.InternalServerErrorException(`Failed to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`);
        }
    }
    async removeNomination(pollID, nominationID) {
        this.logger.log(`Removing nominationID: ${nominationID} from poll: ${pollID}`);
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            const poll = JSON.parse(currentPoll);
            delete poll.nominations[nominationID];
            await this.redisClient.set(key, JSON.stringify(poll));
            return poll;
        }
        catch (e) {
            this.logger.error(`Failed to remove nominationID: ${nominationID} from poll: ${pollID}`, e);
            throw new common_1.InternalServerErrorException(`Failed to remove nominationID: ${nominationID} from poll: ${pollID}`);
        }
    }
    async startPoll(pollID) {
        this.logger.log(`Setting hasStarted for poll: ${pollID}`);
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            const poll = JSON.parse(currentPoll);
            poll.hasStarted = true;
            await this.redisClient.set(key, JSON.stringify(poll));
            return poll;
        }
        catch (e) {
            this.logger.error(`Failed to set hasStarted for poll: ${pollID}`, e);
            throw new common_1.InternalServerErrorException('There was an error starting the poll');
        }
    }
    async addParticipantRankings({ pollID, userID, rankings }) {
        this.logger.log(`Attempting to add rankings for userID: ${userID} to pollID: ${pollID}`, rankings);
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            const poll = JSON.parse(currentPoll);
            poll.rankings = poll.rankings || {};
            poll.rankings[userID] = rankings;
            await this.redisClient.set(key, JSON.stringify(poll));
            return poll;
        }
        catch (e) {
            this.logger.error(`Failed to add rankings for userID: ${userID} to pollID: ${pollID}`, e);
            throw new common_1.InternalServerErrorException('There was an error adding the rankings');
        }
    }
    async addResults(pollID, results) {
        this.logger.log(`Attempting to add results to pollID: ${pollID}`, JSON.stringify(results));
        const key = `polls:${pollID}`;
        try {
            const currentPoll = await this.redisClient.get(key);
            if (!currentPoll) {
                throw new common_1.InternalServerErrorException(`Poll with ID ${pollID} not found`);
            }
            const poll = JSON.parse(currentPoll);
            poll.results = results;
            await this.redisClient.set(key, JSON.stringify(poll));
            return poll;
        }
        catch (e) {
            this.logger.error(`Failed to add results to pollID: ${pollID}`, e);
            throw new common_1.InternalServerErrorException(`Failed to add results to pollID: ${pollID}`);
        }
    }
    async deletePoll(pollID) {
        this.logger.log(`Deleting poll: ${pollID}`);
        const key = `polls:${pollID}`;
        try {
            await this.redisClient.del(key);
        }
        catch (e) {
            this.logger.error(`Failed to delete poll: ${pollID}`, e);
            throw new common_1.InternalServerErrorException(`Failed to delete poll: ${pollID}`);
        }
    }
};
exports.PollsRepository = PollsRepository;
exports.PollsRepository = PollsRepository = PollsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_module_1.IORedisKey)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], PollsRepository);
//# sourceMappingURL=polls.repository.js.map