import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiException } from 'src/shared/api-exception.model';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { GetOperationId } from 'src/shared/utilities/get-operation-id';
import { LoginResponseVm } from './models/login-response-cm.model';
import { LoginVm } from './models/login-vm.model';
import { RegisterVm } from './models/register-vm.model';
import { UserRole } from './models/user-role.enum';
import { UserVm } from './models/user-vm.model';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { DeleteDeviceVm, GetUserVm, UpdateUserVm } from './models/user.dto';
import { GetUser } from 'src/shared/decorators/getUser.decorator';
import { UserServiceV2 } from './user.service.v2';
import { UserRepository } from './user.repository';
import {
  BeAnObject,
  IObjectWithTypegooseFunction,
} from '@typegoose/typegoose/lib/types';
import { Document } from 'mongoose';
import { UserV2 } from './models/user.model.v2';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserControllerV2 {
  constructor(
    private readonly _userServiceV2: UserServiceV2,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.CREATED, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(User.modelName, 'Login'))
  async login(@Body() loginVm: LoginVm): Promise<LoginResponseVm> {
    const fields = Object.keys(loginVm);

    fields.forEach((field) => {
      if (!loginVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    return this._userServiceV2.login(loginVm);
  }

  @Post('register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId(User.modelName, 'Register'))
  async register(@Body() registerVm: RegisterVm): Promise<UserVm> {
    const fields = Object.keys(registerVm);

    fields.forEach((field) => {
      if (!registerVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    const { username } = registerVm;

    let exist: Document<any, BeAnObject, any> &
      UserV2 &
      IObjectWithTypegooseFunction & { _id: any };

    try {
      exist = await this.userRepository.findOne({ username });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (exist) {
      throw new HttpException(`${username} exists`, HttpStatus.BAD_REQUEST);
    }

    return await this._userServiceV2.register(registerVm);
  }

  @Get()
  async getUser(): Promise<any> {
    return await this._userServiceV2.getUser();
  }
}
