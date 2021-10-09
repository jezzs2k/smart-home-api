import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SignOptions, sign } from 'jsonwebtoken';
import { UserV2 } from '../../user/models/user.model.v2';
import { UserRepository } from '../../user/user.repository';
import { Configuration } from '../configurations/configurations.enum';
import { ConfigurationsService } from '../configurations/configurations.service';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class AuthService {
  private readonly jwtOption: SignOptions;
  private readonly jwtKey: string;

  constructor(
    @Inject(forwardRef(() => UserRepository))
    private readonly _userRepository: UserRepository,
    private readonly _configurationService: ConfigurationsService,
  ) {
    this.jwtOption = { expiresIn: '12h' };
    this.jwtKey = _configurationService.get(Configuration.JWT_KEY);
  }

  async signPayload(payload: JwtPayload): Promise<string> {
    return sign(payload, this.jwtKey, this.jwtOption);
  }

  async validatePayload(payload: JwtPayload): Promise<UserV2> {
    return this._userRepository.findOne({
      username: payload.username.toLocaleLowerCase(),
    });
  }
}
