import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "all fields are required");
    return next(error);
  }

  // Database call
  const user = await userModel.findOne({ email });
  if (user) {
    const error = createHttpError(
      400,
      "user with this email already exists, please login"
    );

    return next(error);
  }

  res.json({ message: "register" });
};

export { createUser };
