import { ApiKeyStrategy } from '@App/modules/auth/api-key.strategy';
import { AuthService } from '@App/modules/auth/auth.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [AuthService, ApiKeyStrategy],
  exports: [ApiKeyStrategy],
})
export class AuthModule {}
