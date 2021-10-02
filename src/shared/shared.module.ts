import { Global, Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations/configurations.service';
import { MapperModule } from './mapper/mapper.module';

@Global()
@Module({
  providers: [ConfigurationsService],
  imports: [MapperModule],
  exports: [MapperModule, ConfigurationsService],
})
export class SharedModule {}
