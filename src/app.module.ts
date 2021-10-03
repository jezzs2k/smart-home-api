import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Configuration } from './shared/configurations/configurations.enum';
import { ConfigurationsService } from './shared/configurations/configurations.service';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forRoot(ConfigurationsService.connectionString),
    UserModule,
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
    AppModule.port = AppModule.normalizePort(8080);
    AppModule.host = 'http://localhost';
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
