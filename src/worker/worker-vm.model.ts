import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerVm {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  seconds: number;
}

export class CreateWorkerRealLifeTimeOnOffVm {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  dateOn: string;

  @ApiProperty()
  dateOff: string;
}
