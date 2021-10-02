import { InsertManyOptions, Types } from 'mongoose';
import { Typegoose, ModelType, InstanceType } from 'typegoose';

export class BaseService<T extends Typegoose> {
  protected _model: ModelType<InstanceType<T>>;

  async findAll(filter = {}): Promise<InstanceType<T>[]> {
    return this._model.find(filter).exec();
  }

  async findOne(filter = {}): Promise<InstanceType<T>> {
    return this._model.findOne(filter).exec();
  }

  async findById(id: string): Promise<InstanceType<T>> {
    return this._model.findById(this.toObjectId(id));
  }

  async create(item: InstanceType<T>): Promise<InstanceType<T>> {
    return this._model.create(item);
  }

  async delete(id: string): Promise<InstanceType<T>> {
    return this._model.findByIdAndRemove(this.toObjectId(id)).exec();
  }

  async update(id: string, item): Promise<T> {
    return this._model
      .findByIdAndUpdate(this.toObjectId(id), item, { new: true })
      .exec();
  }

  async insertMany(
    item: InstanceType<T[]>,
    optionInsert: InsertManyOptions,
  ): Promise<T[]> {
    return this._model.insertMany(item, optionInsert);
  }

  async clearCollection(filter = {}): Promise<void> {
    this._model.deleteMany(filter).exec();
  }

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
