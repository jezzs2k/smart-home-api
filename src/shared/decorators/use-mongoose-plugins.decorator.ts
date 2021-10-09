import { applyDecorators } from '@nestjs/common';
import { plugin } from '@typegoose/typegoose';
import * as leanVirtuals from 'mongoose-lean-virtuals';

export const useMongoosePlugin = () =>
  applyDecorators(
    plugin(require('mongoose-autopopulate')),
    plugin(leanVirtuals),
  );
