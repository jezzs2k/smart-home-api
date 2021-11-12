import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerVm {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  seconds: string;
}
