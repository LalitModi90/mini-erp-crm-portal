import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateToken = (payload: object) => {
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = { expiresIn: '1d' };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret as Secret);
};

