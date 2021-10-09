import { UserRole } from './user-role.enum';
import { prop, Ref } from '@typegoose/typegoose';

import { BaseModelV2 } from '../../shared/base.model.v2';
import { useMongoosePlugin } from '../../shared/decorators/use-mongoose-plugins.decorator';
import { DevicesServiceV2 } from '../../devices/devices.service.v2';

@useMongoosePlugin()
export class UserV2 extends BaseModelV2 {
  @prop({
    required: [true, 'Username is required'],
    minlength: [6, 'Must be at least 6 characters'],
    unique: true,
  })
  username: string;

  @prop({
    required: [true, 'password is required'],
    minlength: [6, 'Must be at least 6 characters'],
    unique: true,
  })
  password: string;

  @prop({
    required: [true, 'Email is required'],
    unique: true,
  })
  email: string;

  @prop()
  firstName?: string;

  @prop()
  lastName?: string;

  @prop({
    enum: UserRole,
    default: UserRole.Admin,
  })
  role: UserRole;

  @prop({
    default: false,
  })
  isActive?: boolean;

  @prop({ refPath: 'createdBy' })
  devicesEsp: Ref<DevicesServiceV2>[];
}
