import UserModel from "./models/user.model";
import { UserLoginObject, UserRegisterObject } from "../graphQL/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const createUser = async (data: UserRegisterObject) => {
  try {
    const { username: userName, password: passwordHash, name } = data;

    let exists = await UserModel.findOne({ where: { userName } });

    if (exists) {
      return { userName, message: "User Already Exists , Please Login" };
    }
    const userModel = UserModel.build({ userName, passwordHash, name });
    await userModel.save();

    return { userName, message: "User Saved To Database" };
  } catch (error) {
    console.log(error);
  }
};

declare var process: {
  env: {
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
  };
};

const private_key = process.env.JWT_PRIVATE_KEY;
const public_key = process.env.JWT_PUBLIC_KEY;

export const loginUser = async (data: UserLoginObject) => {
  try {
    const { username: userName, password: passwordHash } = data;
    let user = await UserModel.findOne({ where: { userName } });

    if (!user) {
      return { message: "User Doesnt Exists" };
    }

    const isCorrectPassword = await bcrypt.compareSync(
      passwordHash,
      user.passwordHash
    );

    if (!isCorrectPassword) {
      return { message: "Check Password" };
    }

    // console.log({ secret, user });

    const token = jwt.sign(
      { id: user.id, userName: user.userName },
      process.env.JWT_PRIVATE_KEY
    );

    return {
      token,
      message: "LoggedIn Successfully",
      user: { username: user.userName, name: user.name },
    };
  } catch (error) {
    console.log(error);
  }
};

export interface UserPayload {
  id: number;
  userName: string;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.get("Authorization");

    if (!authToken) {
      req.isAuth = false;
      return next();
    }

    let userPayload;

    try {
      userPayload = jwt.verify(
        authToken,
        process.env.JWT_PUBLIC_KEY
      ) as UserPayload;
    } catch (error) {
      console.log(error);
      req.isAuth = false;
      return next();
    }

    if (!userPayload.id) {
      req.isAuth = false;
      return next();
    }

    const user = await UserModel.findByPk(userPayload.id);

    if (!user) {
      req.isAuth = false;
      return next();
    }

    req.user = user;
    req.isAuth = true;
    next();
  } catch (error) {
    console.log(error);
  }
};
