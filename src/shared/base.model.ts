import { ApiProperty } from '@nestjs/swagger';
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
export abstract class BaseModel {
  @prop()
  createdAt: Date;
  @prop()
  updatedAt: Date;
  id: string; // getter as string
}

export class BaseModelVm {
  @ApiProperty({
    type: 'Date',
  })
  createdAt?: Date;

  @ApiProperty({
    type: 'Date',
  })
  updatedAt?: Date;

  @ApiProperty({
    type: 'string',
  })
  id?: string;
}
