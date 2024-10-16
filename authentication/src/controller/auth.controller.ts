import { NextFunction, Response } from "express";
import { AppError, Request, Role, assignToken, catchAsync, compareHash, } from "../utils";
import Auth from "../model/auth.model";

const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password, role } = req.body;
  if (!req.body) {
    next(new AppError("Please fill all the required fields", 400));
  }

  const user = await Auth.find({ email });
  if (user.length) {
    next(new AppError("An user is already exits with this email", 400));
  }

  const newUser = await Auth.create({
    firstName,
    lastName,
    email,
    password,
    role: role,
  });

  res.status(201).json({
    status: "success",
    error: false,
    message: "User registered successfully",
    data: newUser,
  });
}
);

const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide all the required credentials", 400));
  }

  const users = await Auth.find().byEmail(email).select("password");
  const usedata = await Auth.findOne({ email: email });
  if (!users.length || !(await compareHash(password, users[0]?.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  const accessToken = assignToken(
    {
      id: users[0]?.id,
      email: usedata?.email,
      role: usedata?.role as Role,
    },
    process.env.JWT_SECRET_KEY_DEV!,
    process.env.JWT_EXPIRES_IN_DEV!
  );

  return res.status(200).cookie("accessToken", accessToken, { httpOnly: false, secure: true }).json({
    status: "success",
    error: false,
    message: "User login successfully",
    data: { accessToken }
  });
}
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken");

    res.status(200).json({ 
      status: "success",
      message: "User logged out successfully",
    });
  }
);

export { register, login, logout };
