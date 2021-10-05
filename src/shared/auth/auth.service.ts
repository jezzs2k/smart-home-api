import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SignOptions, sign } from 'jsonwebtoken';
import { User } from 'src/user/models/user.model';
import { UserService } from 'src/user/user.service';
import { InstanceType } from 'typegoose';
import { ConfigurationsService } from '../configurations/configurations.service';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class AuthService {
  private readonly jwtOption: SignOptions;
  private readonly jwtKey: string;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly _userService: UserService,
    private readonly _configurationService: ConfigurationsService,
  ) {
    this.jwtOption = { expiresIn: '12h' };
    // this.jwtKey = _configurationService.get(Configuration.JWT_KEY);
  }

  async signPayload(payload: JwtPayload): Promise<string> {
    return sign(payload, 'MYsercretKey2021', this.jwtOption);
  }

  async validatePayload(payload: JwtPayload): Promise<InstanceType<User>> {
    return this._userService.findOne({
      username: payload.username.toLocaleLowerCase(),
    });
  }
}
