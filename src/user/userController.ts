import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";

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

  const hashedPassword = await bcrypt.hash(password, 10);

  res.json({ message: "register" });
};

export { createUser };
