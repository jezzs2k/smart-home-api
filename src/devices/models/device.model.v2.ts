import { UserV2 } from './../../user/models/user.model.v2';
import { prop, Ref } from '@typegoose/typegoose';

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
    ref: () => UserV2,
    autopopulate: true,
  })
  createdBy: Ref<UserV2>;

  @prop({
    default: false,
  })
  isConnected: boolean;
}
