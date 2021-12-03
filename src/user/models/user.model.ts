import { UserRole } from './user-role.enum';
import { prop, Ref } from '@typegoose/typegoose';

import { BaseModel } from '../../shared/base.model';
import { useMongoosePlugin } from '../../shared/decorators/use-mongoose-plugins.decorator';
import { DeviceEsp } from '../../devices/models/device.model';

export interface WorkerType {
  isRunning: boolean;
  name?: string;
  name1?: string;
  name2?: string;
  seconds?: number;
  createdAt: Date;
  isRealLifeTime: boolean;
  dateOff?: string;
  dateOn?: string;
}
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

  @prop()
  deviceToken?: string;

  @prop({
    enum: UserRole,
    default: UserRole.Admin,
  })
  role: UserRole;

  @prop()
  workers?: WorkerType[];

  @prop({
    default: false,
  })
  isActive?: boolean;

  @prop({ ref: () => DeviceEsp })
  devicesEsp: Ref<DeviceEsp>[];
}
