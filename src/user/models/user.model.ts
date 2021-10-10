import { UserRole } from './user-role.enum';
import { prop, Ref } from '@typegoose/typegoose';

import { BaseModel } from '../../shared/base.model';
import { useMongoosePlugin } from '../../shared/decorators/use-mongoose-plugins.decorator';
import { DeviceEsp } from '../../devices/models/device.model';

@useMongoosePlugin()
export class User extends BaseModel {
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

  @prop({ ref: () => DeviceEsp })
  devicesEsp: Ref<DeviceEsp>[];
}
