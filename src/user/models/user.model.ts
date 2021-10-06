import { UserRole } from './user-role.enum';
import { ModelType, prop, Ref } from 'typegoose';

import { BaseModel, schemaOptions } from 'src/shared/base.model';

export class User extends BaseModel<User> {
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

  // @prop({ ref: Deivece })
  // devicesEsp?: Ref<Deivece>[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  static get model(): ModelType<User> {
    return new User().getModelForClass(User, { schemaOptions });
  }

  static get modelName(): string {
    return this.model.modelName;
  }
}
