import 'express';
import { JwtPayload } from 'src/types/jwt-payload.type';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
