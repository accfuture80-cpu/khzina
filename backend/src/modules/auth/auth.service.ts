import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('اسم المستخدم أو كلمة السر غير صحيحة');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('اسم المستخدم أو كلمة السر غير صحيحة');
    }

    const roles = user.roles.map((r) => r.code);

    const payload = { sub: user.id, username: user.username, roles };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        roles,
      },
    };
  }
}
