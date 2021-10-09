import { modelOptions, prop, Severity } from '@typegoose/typegoose';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
    },
  },
})
export abstract class BaseModelV2 {
  @prop()
  createdAt: Date;
  @prop()
  updatedAt: Date;
  id: string; // getter as string
}
