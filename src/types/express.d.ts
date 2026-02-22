import { UserDetails } from '../interfaceAndTypes';

declare global {
  namespace Express {
    interface Request {
      user?: UserDetails;
    }
  }
}

export {};
