import * as Joi from 'joi';

export default Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().port().default(8008),

  /** Optional second Swagger “Servers” entry (e.g. https://api.example.com). */
  API_PUBLIC_URL: Joi.string().uri().optional(),

  //Jwt
  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.string().default('1h'),
  JWT_REFRESH_TOKEN_TTL: Joi.string().default('24h'),

  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_SYNC: Joi.boolean().default(false),
  DATABASE_AUTO_LOAD_ENTITIES: Joi.boolean().default(true),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
});
