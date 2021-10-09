import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { BaseRepository, ModelType } from '../shared/base.respository';
import { UserV2 } from './models/user.model.v2';

@Injectable()
export class UserRepository extends BaseRepository<UserV2> {
  private _model: ModelType<UserV2>;

  constructor(
    @InjectModel(UserV2) private readonly userModel: ModelType<UserV2>,
  ) {
    super(userModel);
  }

  get modelName(): string {
    return this._model.modelName;
  }
}
