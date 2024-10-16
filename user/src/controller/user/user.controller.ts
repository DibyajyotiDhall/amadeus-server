import { NextFunction, Response } from "express";
import { Request, catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";
import { decodeToken } from "../../utils/jwtHelper";
import { Role, assignToken } from "../../utils/jwtHelper";
import { compareHash } from "../../utils/bcryptHelper";
import User from "../../models/user/user.model";






const updateUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const { firstName, lastName, email, password } = req.body;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return next(new AppError(`No user found with this id ${userId}`, 404));
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, email, password },
        { new: true }
      );
  
      return res.status(200).json({
        status: "success",
        error: false,
        message: "User updated successfully",
        data: updatedUser,
      });
    }
  );

  const deleteUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return next(new AppError(`No user found with this id ${userId}`, 404));
      }
  
      await User.findByIdAndDelete(userId);
  
      res.status(200).json({
        status: "success",
        error: false,
        message: "User deleted successfully",
        data: null,
      });
    }
  );

  // Get a specific user
const getUserById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const user = await User.findById(userId);
  
      if (!user) {
        return next(new AppError(`No user found with this id ${userId}`, 404));
      }
  
      res.status(200).json({
        status: "success",
        error: false,
        message: "User fetched successfully",
        data: user,
      });
    }
  );
  // Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      error: false,
      message: "Users fetched successfully",
      totalUsers: users.length,
      data: users,
    });
  });

  export {  updateUser,getAllUsers, getUserById, deleteUser };



  