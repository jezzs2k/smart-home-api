import { Module } from '@nestjs/common';
import { UserV2 } from './models/user.model.v2';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserServiceV2 } from './user.service.v2';
import { UserControllerV2 } from './user.controller.v2';
import { UserRepository } from './user.repository';

@Module({
  imports: [TypegooseModule.forFeature([UserV2])],
  controllers: [UserControllerV2],
  providers: [UserServiceV2, UserRepository],
  exports: [UserServiceV2, UserRepository],
})
export class UserModule {}
