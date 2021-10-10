import { Injectable } from '@nestjs/common';
import * as config from 'config';
import { Configuration } from './configurations.enum';

const { get } = config;

@Injectable()
export class ConfigurationsService {
  static connectionString: string =
    process.env[Configuration.MONGO_URI] || config.get(Configuration.MONGO_URI);

  private environmentHosting: string = process.env.NODE_ENV || 'development';

  get(name: string): string {
    return process.env[name] || config.get(name);
  }

  get isDevelopment(): boolean {
    return this.environmentHosting === 'development';
  }
}
