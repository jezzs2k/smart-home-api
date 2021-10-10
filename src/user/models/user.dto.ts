import { ApiProperty } from '@nestjs/swagger';

export class GetUserVm {
  @ApiProperty() userId: string;
}

export class UpdateUserVm {
  @ApiProperty() firstname?: string;
  @ApiProperty() lastname?: string;
}
