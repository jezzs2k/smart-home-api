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
import { UpdateUserVm } from './models/user.dto';
import { GetUser } from 'src/shared/decorators/getUser.decorator';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import {
  BeAnObject,
  IObjectWithTypegooseFunction,
} from '@typegoose/typegoose/lib/types';
import { Document } from 'mongoose';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly _userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.CREATED, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async login(@Body() loginVm: LoginVm): Promise<LoginResponseVm> {
    const fields = Object.keys(loginVm);

    fields.forEach((field) => {
      if (!loginVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    return this._userService.login(loginVm);
  }

  @Post('register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async register(@Body() registerVm: RegisterVm): Promise<UserVm> {
    const fields = Object.keys(registerVm);

    fields.forEach((field) => {
      if (!registerVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    const { username } = registerVm;

    let exist: Document<any, BeAnObject, any> &
      User &
      IObjectWithTypegooseFunction & { _id: any };

    try {
      exist = await this.userRepository.findOne({ username });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (exist) {
      throw new HttpException(`${username} exists`, HttpStatus.BAD_REQUEST);
    }

    return await this._userService.register(registerVm);
  }

  @Get('/')
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async getUser(@GetUser() user: User): Promise<any> {
    return await this._userService.getUser(user.id);
  }

  @Put('/')
  @ApiBearerAuth()
  @Roles(UserRole.Admin)
  @UseGuards(AuthGuard('jwt'), new RolesGuard(new Reflector()))
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  async updateUser(
    @Body() updateUserVm: UpdateUserVm,
    @GetUser() userPayload: User,
  ): Promise<UserVm> {
    const userId = userPayload.id;

    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new HttpException("Can't not find user!", HttpStatus.NOT_FOUND);
      }
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!updateUserVm) {
      throw new HttpException(
        'Params id must provide !',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this._userService.updateUser(updateUserVm, userId);

    return user;
  }
}
