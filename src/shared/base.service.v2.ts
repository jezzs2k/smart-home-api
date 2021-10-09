import 'automapper-ts/dist/automapper';

import { LeanDocument, Types } from 'mongoose';
import { BaseRepository, ModelType } from './base.respository';
import { BaseModelV2 } from './base.model.v2';

export class BaseServiceV2<T extends BaseModelV2> {
  protected _mapper: AutoMapperJs.AutoMapper;
  protected _repository: BaseRepository<T>;

  private get modelName(): string {
    return this._repository.modelName;
  }

  private get viewModeName(): string {
    const modelName = this._repository.modelName;
    return `${modelName}Vm`;
  }

  async map<K>(
    object: LeanDocument<T> | LeanDocument<T>[],
    isArray: boolean = false,
    sourceKey?: string,
    destrinationKey?: string,
  ): Promise<K> {
    const _sourceKey = isArray
      ? `${sourceKey || this.modelName}[]`
      : sourceKey || this.modelName;
    const _detrinationKey = isArray
      ? `${destrinationKey || this.viewModeName}[]`
      : destrinationKey || this.viewModeName;

    return this._mapper.map(_sourceKey, _detrinationKey, object);
  }

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
