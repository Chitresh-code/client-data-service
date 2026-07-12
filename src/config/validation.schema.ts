import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('local', 'staging', 'production', 'test')
    .default('local'),
  PORT: Joi.number().default(3000),
  CORS_ORIGINS: Joi.string().allow('').default(''),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_NAME: Joi.string().required(),

  AUTH_JWKS_URI: Joi.string().uri().required(),
  AUTH_ISSUER: Joi.string().uri().required(),
});
