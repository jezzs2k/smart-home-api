import { InternalServerErrorException } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import {
  CreateQuery,
  EnforceDocument,
  FilterQuery,
  QueryFindOneAndUpdateOptions,
  QueryWithHelpers,
  Types,
  UpdateQuery,
  ObjectId,
  QueryOptions as MongooseQueryOptions,
} from 'mongoose';
import { MongoError } from 'mongodb';
import { BaseModel } from './base.model';

export type EnforceDocumentType<TModel extends BaseModel> = EnforceDocument<
  DocumentType<TModel>,
  Record<string, unknown>,
  {}
>;

export type QueryList<TModel extends BaseModel> = QueryWithHelpers<
  Array<EnforceDocumentType<TModel>>,
  EnforceDocumentType<TModel>
>;
export type QueryItem<TModel extends BaseModel> = QueryWithHelpers<
  EnforceDocumentType<TModel>,
  EnforceDocumentType<TModel>
>;

interface QueryOptions {
  lean?: boolean;
  autopopulate?: boolean;
}

export type ModelType<TModel extends BaseModel> = ReturnModelType<
  AnyParamConstructor<TModel>
>;

export abstract class BaseRepository<TModel extends BaseModel> {
  protected model: ModelType<TModel>;

  protected constructor(model: ModelType<TModel>) {
    this.model = model;
  }

  private static get defaultOptions(): QueryOptions {
    return { lean: true, autopopulate: true };
  }

  private static getQueryOptions(options: QueryOptions) {
    const mergedOptions = {
      ...BaseRepository.defaultOptions,
      ...(options || {}),
    };

    const option = mergedOptions.lean ? { virtuals: true } : null;

    if (option && mergedOptions.autopopulate) {
      option['autopopulate'] = true;
    }

    return { lean: option, autopopulate: mergedOptions.autopopulate };
  }

  protected static throwMongoError(err: MongoError): void {
    throw new InternalServerErrorException(err, err.message);
  }

  createModel(doc?: Partial<TModel>): TModel {
    if (doc) {
      return new this.model(doc as TModel);
    } else {
      return new this.model();
    }
  }

  findAll(filter = {}, options?: QueryOptions): QueryList<TModel> {
    return this.model
      .find(filter)
      .setOptions(BaseRepository.getQueryOptions(options));
  }

  findOne(filter = {}, options?: QueryOptions): QueryItem<TModel> {
    return this.model
      .findOne(filter)
      .setOptions(BaseRepository.getQueryOptions(options));
  }

  findById(id: string, options?: QueryOptions): QueryItem<TModel> {
    return this.model
      .findById(this.toObjectId(id))
      .setOptions(BaseRepository.getQueryOptions(options));
  }

  async create(item: CreateQuery<TModel>): Promise<DocumentType<TModel>> {
    try {
      return await this.model.create(item);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  deleteOne(
    filter: FilterQuery<DocumentType<TModel>> = {},
    options?: QueryOptions,
  ): QueryItem<TModel> {
    return this.model
      .findOneAndDelete(filter)
      .setOptions(BaseRepository.getQueryOptions(options));
  }

  deleteById(id: string, options?: QueryOptions): QueryItem<TModel> {
    return this.model
      .findByIdAndDelete(this.toObjectId(id))
      .setOptions(BaseRepository.getQueryOptions(options));
  }

  update(item: TModel, options?: QueryOptions): QueryItem<TModel> {
    return this.model
      .findByIdAndUpdate(this.toObjectId(item.id), { $set: item } as any, {
        omitUndefined: true,
        new: true,
      })
      .setOptions(BaseRepository.getQueryOptions(options));
  }

  updateById(
    id: string,
    updateQuery: UpdateQuery<DocumentType<TModel>>,
    updateOptions: QueryFindOneAndUpdateOptions & { multi?: boolean } = {},
    options?: QueryOptions,
  ): QueryItem<TModel> {
    return this.updateByFilter(
      { _id: this.toObjectId(id) as any },
      updateQuery,
      updateOptions,
      options,
    );
  }

  updateByFilter(
    filter: FilterQuery<DocumentType<TModel>> = {},
    updateQuery: UpdateQuery<DocumentType<TModel>>,
    updateOptions: QueryFindOneAndUpdateOptions = {},
    options?: QueryOptions,
  ): QueryItem<TModel> {
    return this.model
      .findOneAndUpdate(filter, updateQuery, {
        ...Object.assign({ omitUndefined: true }, updateOptions),
        new: true,
      })
      .setOptions(BaseRepository.getQueryOptions(options));
  }

  count(
    filter: FilterQuery<DocumentType<TModel>> = {},
  ): QueryWithHelpers<number, EnforceDocumentType<TModel>> {
    return this.model.count(filter);
  }

  async countAsync(
    filter: FilterQuery<DocumentType<TModel>> = {},
  ): Promise<number> {
    try {
      return await this.count(filter);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  async exists(
    filter: FilterQuery<DocumentType<TModel>> = {},
  ): Promise<boolean> {
    try {
      return await this.model.exists(filter);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  get modelName(): string {
    return this.model.modelName;
  }

  toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
