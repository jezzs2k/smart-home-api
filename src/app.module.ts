import { Module, CacheModule, CacheStoreFactory } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Configuration } from './shared/configurations/configurations.enum';
import { ConfigurationsService } from './shared/configurations/configurations.service';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { FirebaseService } from './firebase/firebase.service';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    SharedModule,
    TypegooseModule.forRoot(ConfigurationsService.connectionString),
    UserModule,
    DevicesModule,
    CacheModule.register({
      store: redisStore as CacheStoreFactory,
      host: 'localhost',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
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
    AppModule.host =
      _configurationsService.get(Configuration.HOST) || 'http://localhost';
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
