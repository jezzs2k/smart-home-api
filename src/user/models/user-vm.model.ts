import { ApiProperty } from '@nestjs/swagger';

import { BaseModelVm } from 'src/shared/base.model';

export class UserVm {
  @ApiProperty()
  username: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  fullName?: string;
}
