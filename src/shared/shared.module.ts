import { Global, Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations/configurations.service';
import { MapperService } from './mapper/mapper.service';
import { AuthService } from './auth/auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtStrategyService } from './auth/jwt-strategy/jwt-strategy.service';

@Global()
@Module({
  providers: [
    ConfigurationsService,
    MapperService,
    AuthService,
    JwtStrategyService,
  ],
  imports: [UserModule],
  exports: [ConfigurationsService, MapperService, AuthService],
})
export class SharedModule {}
