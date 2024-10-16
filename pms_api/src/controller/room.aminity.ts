import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { RoomAminity } from "../model/room.amenite.model";
import { PropertyInfo } from "../model/property.info.model";
import { Room } from "../model/room.model"
const createRoomAminity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { propertyInfo_id,
        // name, type,
        amenities } = req.body;

      console.log(req.body)

      if (!req.body) {
        next(new AppError("Please fill all the required fields", 400));
      }

      const roomAminitycreate = await RoomAminity.create({
        propertyInfo_id,
        // name,
        // type,
        amenities,
      });
      const updatedInfo = await PropertyInfo.findByIdAndUpdate(
        propertyInfo_id,
        { room_Aminity: roomAminitycreate._id }
      );

      if (!updatedInfo) {
        throw new AppError("PropertyInfo not found", 404);
      }

      console.log("PropertyInfo updated:", updatedInfo);
      console.log("roomAminityInfo updated:", roomAminitycreate);

      res.status(201).json({
        status: "success",
        error: false,
        message: "Room Aminity registered successfully",
        data: roomAminitycreate,
        propertyinfo: updatedInfo,
      });
    } catch (error) {
      next(error);
    }
  }
);

// update room amenity
const updateRoomAmenity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyInfo_id, amenities } = req.body;

    if (!req.body) {
      next(new AppError("Please fill all the required fields", 400));
    }

    const updatedRoomAminity = await RoomAminity.findOneAndUpdate(
      { propertyInfo_id },
      { $set: { amenities } },
      { new: true }
    );
    console.log("updatedRoomAminity:", updatedRoomAminity)

    return res.json({
      success: true,
      updatedRoomAminity
    })

  } 
  catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
    });
  }
}

const getRoomAminity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyInfo_id = req.params.id;  // Room amenity belonbgs to property so we need to pass property id

    const roomAminity = await RoomAminity.findOne({ propertyInfo_id }).lean();

    if (!roomAminity) {
      return next(new AppError(`No property found with this id ${propertyInfo_id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: roomAminity
    })
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
    });
  }
}

export { createRoomAminity, updateRoomAmenity, getRoomAminity };
