import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/config/jwt.config';
import { UserService } from 'src/user/provider/user.service';
import { GenerateTokenProvider } from 'src/auth/provider/generate-token.provider';
import { randomUUID } from 'crypto';
import { GoogleTokenDto } from '../dto/google-token.dto';

@Injectable()
export class GoogleAuthenticationProvider implements OnModuleInit{
  private oauthClient: OAuth2Client;
  private readonly logger = new Logger(GoogleAuthenticationProvider.name);

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UserService,
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  public async authenticate(googleIdToken: GoogleTokenDto) {
    try {
      // verify the Google ID token sent by the user
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleIdToken.token,
        audience: this.jwtConfiguration.googleClientId,
      });

      const payload = loginTicket.getPayload();
      this.logger.log('Payload extracted:', payload);

      if (!payload) {
        throw new Error('Invalid Google ID token payload');
      }

      const { email, sub: googleId, name, given_name, family_name, email_verified, picture } = payload;

      if (!email || !googleId) {
        throw new Error('Required user information not available from Google');
      }

      //  find the user in the database or create a new one
      this.logger.log('Searching for existing user...');
      let user = await this.userService.findOneByGoogleId(googleId);

      if (!user) {
        // if user doesn't exist, create a new one
        this.logger.log('No existing user found, creating a new user...');
        user = await this.userService.create({
          email,
          googleId,
          profilePicture: picture || undefined,
          fullName: name || undefined,
          firstName: given_name || undefined,
          lastName: family_name || undefined,
          isEmailVerified: email_verified || false,
        });
      } else {
        this.logger.log('Existing user found.');
      }

      const sessionId = randomUUID();
      const tokens = await this.generateTokenProvider.generateToken(user, sessionId);
      this.logger.log('Tokens generated successfully for user with session ID:', sessionId);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        sessionId,
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      this.logger.error('Google authentication failed:', error.message);
      this.logger.error('Error stack:', error.stack);
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }
}