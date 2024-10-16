import { NextFunction, Response } from "express";
import { AppError, Request, catchAsync } from "../utils";
import Auth from "../model/auth.model";

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user;

    const user = await Auth.findById(userId);

    if (!user) {
      return next(new AppError("No user found", 404));
    }

    res.status(200).json({
      status: "success",
      error: false,
      message: "User fetched successfully",
      data: {
        user,
      },
    });
  }
);

interface UpdateBody {
  firstName?: string;
  lastName?: string;
  email?: string;
}
export const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user;
    const Role = req.role;

    const { firstName, lastName, email } = req.body;
    if (Role !== "superadmin") {
      return next(new AppError("You are not allowed to perform this  action", 401));
    }
    const updates: UpdateBody = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;

    try {
      const updatedUser = await Auth.findByIdAndUpdate(userId, updates, {
        new: true,
      });
      console.log("update data user", updatedUser);

      if (!updatedUser) {
        return res.status(404).json({
          status: "error",
          message: "No user found",
        });
      }

      res.status(200).json({
        status: "success",
        message: "User profile updated successfully",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to update profile",
      });
    }
  }
);
