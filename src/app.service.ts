import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getHello(): Promise<any> {
    const hello = await this.cacheManager.get('hello-world');

    if (_.isNull(hello)) {
      await this.cacheManager.set('hello-world', 'hello-world', { ttl: 180 });

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
