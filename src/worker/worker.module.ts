import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';
import { DevicesModule } from 'src/devices/devices.module';
import { UserModule } from 'src/user/user.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';

@Module({
  imports: [DevicesModule, UserModule, RedisCacheModule],
  providers: [WorkerService, FirebaseService],
  controllers: [WorkerController],
})
export class WorkerModule {}
