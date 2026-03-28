import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './provider/auth.service';
import { GoogleAuthenticationProvider } from './provider/google-authentication.provider';
import { RefreshTokenProvider } from './provider/refresh-token.provider';
import { TokenBlacklistProvider } from './provider/token-blacklist.provider';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: GoogleAuthenticationProvider, useValue: {} },
        { provide: RefreshTokenProvider, useValue: {} },
        { provide: TokenBlacklistProvider, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
