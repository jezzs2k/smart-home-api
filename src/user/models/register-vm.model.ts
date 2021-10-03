import { ApiProperty } from '@nestjs/swagger';
import { LoginVm } from './login-vm.model';

export class RegisterVm extends LoginVm {
  @ApiProperty() firstName?: string;
  @ApiProperty() lastName?: string;
}
