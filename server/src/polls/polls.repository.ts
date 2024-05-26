import { Injectable, Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IORedisKey } from 'src/redis/redis.module';
import { AddNominationData, AddParticipantData, AddParticipantRankingsData, CreatePollData } from './types';
import { Poll, Results } from 'shared';

@Injectable()
export class PollsRepository {
  private readonly ttl: number;
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    private configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = this.configService.get<number>('POLL_DURATION') || 7200;
  }

  async createPoll({ votesPerVoter, topic, pollID, userID }: CreatePollData): Promise<Poll> {
    const initialPoll: Poll = {
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
    } catch (e) {
      this.logger.error(`Failed to add poll to Redis: ${e.message}`, e);
      throw new InternalServerErrorException(`Failed to add poll to Redis: ${e.message}`);
    }
  }

  async getPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Attempting to get poll with: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      this.logger.verbose(currentPoll);

      return JSON.parse(currentPoll);
    } catch (e) {
      this.logger.error(`Failed to get pollID ${pollID}`, e);
      throw new InternalServerErrorException(`Failed to get pollID ${pollID}`);
    }
  }

  async addParticipant({ pollID, userID, name }: AddParticipantData): Promise<Poll> {
    this.logger.log(`Attempting to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      const poll = JSON.parse(currentPoll);
      poll.participants = poll.participants || {};
      poll.participants[userID] = name;

      await this.redisClient.set(key, JSON.stringify(poll));

      return poll;
    } catch (e) {
      this.logger.error(`Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`, e);
      throw new InternalServerErrorException(`Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`);
    }
  }

  async removeParticipant(pollID: string, userID: string): Promise<Poll> {
    this.logger.log(`Removing userID: ${userID} from poll: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      const poll = JSON.parse(currentPoll);
      delete poll.participants[userID];

      await this.redisClient.set(key, JSON.stringify(poll));

      return poll;
    } catch (e) {
      this.logger.error(`Failed to remove userID: ${userID} from poll: ${pollID}`, e);
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  async addNomination({ pollID, nominationID, nomination }: AddNominationData): Promise<Poll> {
    this.logger.log(`Attempting to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      const poll = JSON.parse(currentPoll);
      poll.nominations = poll.nominations || {};
      poll.nominations[nominationID] = nomination;

      await this.redisClient.set(key, JSON.stringify(poll));

      return poll;
    } catch (e) {
      this.logger.error(`Failed to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`, e);
      throw new InternalServerErrorException(`Failed to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`);
    }
  }

  async removeNomination(pollID: string, nominationID: string): Promise<Poll> {
    this.logger.log(`Removing nominationID: ${nominationID} from poll: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      const poll = JSON.parse(currentPoll);
      delete poll.nominations[nominationID];

      await this.redisClient.set(key, JSON.stringify(poll));

      return poll;
    } catch (e) {
      this.logger.error(`Failed to remove nominationID: ${nominationID} from poll: ${pollID}`, e);
      throw new InternalServerErrorException(`Failed to remove nominationID: ${nominationID} from poll: ${pollID}`);
    }
  }

  async startPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Setting hasStarted for poll: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      const poll = JSON.parse(currentPoll);
      poll.hasStarted = true;

      await this.redisClient.set(key, JSON.stringify(poll));

      return poll;
    } catch (e) {
      this.logger.error(`Failed to set hasStarted for poll: ${pollID}`, e);
      throw new InternalServerErrorException('There was an error starting the poll');
    }
  }

  async addParticipantRankings({ pollID, userID, rankings }: AddParticipantRankingsData): Promise<Poll> {
    this.logger.log(`Attempting to add rankings for userID: ${userID} to pollID: ${pollID}`, rankings);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      const poll = JSON.parse(currentPoll);
      poll.rankings = poll.rankings || {};
      poll.rankings[userID] = rankings;

      await this.redisClient.set(key, JSON.stringify(poll));

      return poll;
    } catch (e) {
      this.logger.error(`Failed to add rankings for userID: ${userID} to pollID: ${pollID}`, e);
      throw new InternalServerErrorException('There was an error adding the rankings');
    }
  }

  async addResults(pollID: string, results: Results): Promise<Poll> {
    this.logger.log(`Attempting to add results to pollID: ${pollID}`, JSON.stringify(results));

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      if (!currentPoll) {
        throw new InternalServerErrorException(`Poll with ID ${pollID} not found`);
      }

      const poll = JSON.parse(currentPoll);
      poll.results = results;

      await this.redisClient.set(key, JSON.stringify(poll));

      return poll;
    } catch (e) {
      this.logger.error(`Failed to add results to pollID: ${pollID}`, e);
      throw new InternalServerErrorException(`Failed to add results to pollID: ${pollID}`);
    }
  }

  async deletePoll(pollID: string): Promise<void> {
    this.logger.log(`Deleting poll: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      await this.redisClient.del(key);
    } catch (e) {
      this.logger.error(`Failed to delete poll: ${pollID}`, e);
      throw new InternalServerErrorException(`Failed to delete poll: ${pollID}`);
    }
  }
}
