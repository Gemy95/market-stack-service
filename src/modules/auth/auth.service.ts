import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async validateApiKey(apiKey: string): Promise<boolean> {
    const validApiKey = this.configService.get<string>('API_KEY');
    return validApiKey === apiKey;
  }
}
