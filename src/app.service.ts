import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import { RedisCacheService } from './redis-cache/redis-cache.service';
@Injectable()
export class AppService {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  async getHello(): Promise<any> {
    const hello = await this.redisCacheService.get('hello-world');

    if (_.isNull(hello)) {
      await this.redisCacheService.set('hello-world', 'hello-world', {
        ttl: 180,
      });

      return {
        data: 'hello-world',
        fromData: 'fake memory',
      };
    }
    return {
      data: hello,
      fromData: 'Cache memory',
    };
  }
}
