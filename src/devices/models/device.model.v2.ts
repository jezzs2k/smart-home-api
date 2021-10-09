import { prop, Ref } from '@typegoose/typegoose';

import { User } from 'src/user/models/user.model';
import { BaseModelV2 } from '../../shared/base.model.v2';
import { useMongoosePlugin } from '../../shared/decorators/use-mongoose-plugins.decorator';

@useMongoosePlugin()
export class DeviceEspV2 extends BaseModelV2 {
  @prop()
  deviceName: string;

  @prop({})
  deviceType?: string;

  @prop({})
  deviceId: string;

  @prop({
    ref: () => User,
  })
  createdBy: Ref<User>;

  @prop({
    default: false,
  })
  isConnected: boolean;
}
