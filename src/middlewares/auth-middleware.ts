import { Request, Response, NextFunction } from 'express';
import ApiError from '../exceptions/api-error';
import tokenService from '../services/token-service';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }
    const userData = tokenService.validateAccessToken(authorizationHeader);

    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    // req.user = userData;
    next();
  } catch (error) {
    return next(ApiError.UnauthorizedError());
  }
}
