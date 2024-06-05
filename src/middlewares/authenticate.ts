import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";

export interface CustomRequest extends Request {
  userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");

  if (!token) {
    return next(createHttpError(401, "Authorization token is required"));
  }

  try {
    const parsedToken = token.split(" ")[1];

    const decode = verify(parsedToken, process.env.JWT_SECRET!);
    if (!decode) {
      return next(createHttpError(401, "unauthorized"));
    }

    const _req = req as CustomRequest;
    _req.userId = decode.sub as string;

    next();
  } catch (error) {
    return next(createHttpError(401, "Token expired"));
  }
};

export default authenticate;
