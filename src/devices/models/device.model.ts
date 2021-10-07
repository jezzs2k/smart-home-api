import { ModelType, prop, Ref } from 'typegoose';

import { BaseModel, schemaOptions } from 'src/shared/base.model';
import { User } from 'src/user/models/user.model';

export class DeviceEsp extends BaseModel<DeviceEsp> {
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

  static get model(): ModelType<DeviceEsp> {
    return new DeviceEsp().getModelForClass(User, { schemaOptions });
  }

  static get modelName(): string {
    return this.model.modelName;
  }
}
