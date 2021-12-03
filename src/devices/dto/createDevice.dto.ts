import { ApiProperty } from '@nestjs/swagger';
export class CreateDeviceDto {
  @ApiProperty({ required: true })
  deviceId: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty()
  deviceType: string;

  @ApiProperty({ default: false })
  isConnected: boolean;

  @ApiProperty({ default: 0 })
  icon: number;
}
