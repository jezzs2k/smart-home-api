import { ApiProperty } from '@nestjs/swagger';

import { BaseModelVm } from 'src/shared/base.model';
import { WorkerType } from '../models/user.model';

export class UserVm extends BaseModelVm {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  deviceToken?: string;

  @ApiProperty()
  workers?: WorkerType[];

  @ApiProperty()
  fullName?: string;
}
