import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Configuration } from './shared/configurations/configurations.enum';
import { ConfigurationsService } from './shared/configurations/configurations.service';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { DevicesModule } from './devices/devices.module';
import { WorkerModule } from './worker/worker.module';
import { FirebaseConfig } from './firebase/firebase-config.service';
import { FirebaseService } from './firebase/firebase.service';
import { RedisCacheModule } from './redis-cache/redis-cache.module';

@Module({
  imports: [
    RedisCacheModule,
    SharedModule,
    TypegooseModule.forRoot(ConfigurationsService.connectionString),
    UserModule,
    DevicesModule,
    ScheduleModule.forRoot(),
    WorkerModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseConfig, FirebaseService],
})
export class AppModule {
  static host: string;
  static port: number | string;
  static isDev: boolean;
  static configFirebase: any;

  constructor(private readonly _configurationsService: ConfigurationsService) {
    AppModule.port = AppModule.normalizePort(
      _configurationsService.get(Configuration.PORT),
    );
    AppModule.host = _configurationsService.isDevelopment
      ? 'http://localhost'
      : _configurationsService.get(Configuration.HOST);
    AppModule.isDev = _configurationsService.isDevelopment;
  }

  private static normalizePort(param: number | string): number | string {
    const portNumber: number =
      typeof param === 'string' ? parseInt(param, 10) : param;

    if (isNaN(portNumber)) {
      return param;
    } else if (portNumber >= 0) return portNumber;
  }
}
