import { User } from './../../user/models/user.model';
import { prop, Ref } from '@typegoose/typegoose';

import { BaseModel } from '../../shared/base.model';
import { useMongoosePlugin } from '../../shared/decorators/use-mongoose-plugins.decorator';

@useMongoosePlugin()
export class DeviceEsp extends BaseModel {
  @prop()
  deviceName: string;

  @prop({})
  deviceType?: string;

  @prop({})
  deviceId: string;

  @prop({
    ref: () => User,
    autopopulate: true,
  })
  createdBy: Ref<User>;

  @prop({
    default: false,
  })
  isConnected: boolean;
}
