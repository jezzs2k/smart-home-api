import { ApiProperty } from '@nestjs/swagger';
import { LoginVm } from './login-vm.model';

export class RegisterVm extends LoginVm {
  @ApiProperty() email: string;
}
