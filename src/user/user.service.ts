import { ModelType, InstanceType } from 'typegoose';
import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcryptjs';

import { BaseService } from './../shared/base.service';
import { User } from './models/user.model';
import { RegisterVm } from './models/register-vm.model';
import { UserVm } from './models/user-vm.model';
import { LoginVm } from './models/login-vm.model';
import { LoginResponseVm } from './models/login-response-cm.model';
import { MapperService } from 'src/shared/mapper/mapper.service';
import { JwtPayload } from 'src/shared/auth/jwt.payload';
import { AuthService } from 'src/shared/auth/auth.service';
import { GetUserVm, UpdateUserVm } from './models/user.dto';
import { DeviceEsp } from '../devices/models/device.model';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectModel(User.modelName)
    private readonly _userModal: ModelType<InstanceType<User>>,
    private readonly _mapperService: MapperService,
    @Inject(forwardRef(() => AuthService)) readonly _authService: AuthService,
  ) {
    super();
    this._mapper = _mapperService.mapper;
    this._model = _userModal;
  }

  async register(register: RegisterVm): Promise<UserVm> {
    const { username, password, email } = register;

    const newUser = new this._model();
    newUser.username = username;
    newUser.email = email;

    const salt = 10;
    newUser.password = await hash(password, salt);

    try {
      const result = await this.create(newUser);

      return (await this.map<UserVm>(result.toJSON())) as UserVm;
    } catch (e) {
      //MongoError
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(login: LoginVm): Promise<LoginResponseVm> {
    const { username, password } = login;

    const user = await this.findOne({ username });

    if (!user) {
      throw new HttpException('Invalid creadentials', HttpStatus.BAD_REQUEST);
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new HttpException('Invalid creadentials', HttpStatus.BAD_REQUEST);
    }

    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = await this._authService.signPayload(payload);

    const userVm: UserVm = await this.map<UserVm>(user.toJSON());

    return {
      token,
      user: userVm,
    };
  }

  async getUser(userId: string): Promise<UserVm> {
    try {
      const user = await this._model
        .findOne({ _id: userId })
        .populate('devicesEsp', 'deviceId deviceName', DeviceEsp.modelName);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return this.map<UserVm>(user.toJSON());
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(updateUser: UpdateUserVm, userId: string): Promise<UserVm> {
    const firstname = updateUser?.firstname;
    const lastname = updateUser?.lastname;
    const deviceEsp = updateUser?.devicesEsp;

    // let newDevice: DeiveceEsp;

    // if (deviceEsp) {
    //   newDevice = new DeiveceEsp();

    //   const deviceName = deviceEsp?.deviceName;
    //   const deviceType = deviceEsp?.deviceType;
    //   const deviceId = deviceEsp.deviceEspId;
    //   const isConnected = !!deviceEsp.isConnected;

    //   newDevice.deviceId = deviceId;
    //   newDevice.isConnected = isConnected;

    //   if (deviceType) newDevice.deviceType = deviceType;
    //   if (deviceName) newDevice.deviceName = deviceName;
    // }

    try {
      const user = await this.findById(userId);
      if (firstname) user.firstName = firstname;

      if (lastname) user.lastName = lastname;

      // if (newDevice) {
      //   if (user.devicesEsp?.length > 0) {
      //     const deviceExist = user.devicesEsp.find(
      //       (item) => item.deviceId === newDevice.deviceId,
      //     );

      //     if (!deviceExist) {
      //       user.devicesEsp = [...user.devicesEsp, newDevice];
      //     } else {
      //       user.devicesEsp = user.devicesEsp.map((item) => {
      //         if (item.deviceId === deviceExist.deviceId) {
      //           return newDevice;
      //         } else {
      //           return item;
      //         }
      //       });
      //     }
      //   } else {
      //     user.devicesEsp = [newDevice];
      //   }
      // }

      const savedUser = await user.save();

      return this.map<UserVm>(user.toJSON());
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDevice(deviceId: string, userId: string): Promise<UserVm> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new HttpException("Can't not found user!", HttpStatus.NOT_FOUND);
      }

      // const devices = user.devicesEsp;

      // const deviceFound = devices.find((item) => item.deviceId === deviceId);

      // if (!deviceFound) {
      //   throw new HttpException(
      //     "Can't not found device with id: " + deviceId,
      //     HttpStatus.NOT_FOUND,
      //   );
      // }

      // const newDevices = devices.filter((item) => item.deviceId !== deviceId);

      // user.devicesEsp = newDevices;

      // const userSaved = await user.save();

      return this.map<UserVm>(user.toJSON());
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
