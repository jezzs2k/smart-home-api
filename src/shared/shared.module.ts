import { Global, Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations/configurations.service';
import { MapperService } from './mapper/mapper.service';

@Global()
@Module({
  providers: [ConfigurationsService, MapperService],
  imports: [],
  exports: [ConfigurationsService, MapperService],
})
export class SharedModule {}
