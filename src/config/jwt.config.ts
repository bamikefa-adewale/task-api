import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_TOKEN_AUDIENCE,
  issuer: process.env.JWT_TOKEN_ISSUER,
  accessToken: process.env.JWT_ACCESS_TOKEN_TTL ?? '1h',
  refreshToken: process.env.JWT_REFRESH_TOKEN_TTL ?? '24h',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
}));
