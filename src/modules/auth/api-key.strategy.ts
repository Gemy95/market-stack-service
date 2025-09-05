import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '@App/modules/auth/auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  constructor(private readonly authService: AuthService) {
    super({ header: 'x-api-key', prefix: '' }, false);
  }

  async validate(apiKey: string) {
    const isValid = await this.authService.validateApiKey(apiKey);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
