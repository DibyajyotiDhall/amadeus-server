import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { PropertyInfo } from "../model/property.info.model";
import { decodeToken } from "../utils/jwtHelper";
import { UserType } from "../model/user.model";
import { Category } from "../model/propertycategory.model";
import PropertyCategory from "../model/propertycategory.model"
import { Role } from "../utils/jwtHelper";
import { PropertyAddress } from "../model/property.address.model";
import { propertyAminity } from "../model/propertyamenite.model";
import { RoomAminity } from "../model/room.amenite.model";
import PropertyPrice from "../model/ratePlan.model";
import PropertyType from "../model/propertytype.model";
import PropertyRatePlan from "../model/ratePlan.model";
import mongoose from "mongoose";

const getMyProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    // const role = req.role;
    const properties = await PropertyInfo.find({ user_id: user, isDraft: false });
    const draftProperties = await PropertyInfo.find({ user_id: user, isDraft: true });

    res.status(200).json({
      status: "success",
      error: "false",
      message: "Data fetched successfully",
      data: {
        properties,
        draftProperties,
      },
    });
  }
);

const createpropertyInfo = catchAsync(
  async (
    req: Request<UserType["userId"]>,
    res: Response,
    next: NextFunction
  ) => {
    if (req.role === "user") {
      return next(
        new AppError("You are not allowed to perform this  action", 401)
      );
    }

    const user = req.user;
    // const Role = req.role;
    // console.log("Request Body from Create property info", req);
    // console.log("UserId From Create Perporty", user);
    // console.log("userRole From Create Perporty", Role);

    let isHotelFlow = false;
    let isHomestayFlow = false;

    const {
      property_name,
      property_email,
      property_contact,
      star_rating,
      property_code,
      image,
      description,
      property_category,
      property_type,
    } = req.body;

    const propertyCategory = property_category as Category;

    if (propertyCategory === Category.HOTEL) isHotelFlow = true;
    if (propertyCategory === Category.HOMESTAY) isHomestayFlow = true;

    if (!req.body) {
      next(new AppError("Please fill all the required fields", 400));
    }

    const property = await PropertyInfo.find({
      property_email,
    });

    if (property.length) {
      next(new AppError("A property is already exits with this email", 400));
    }

    const newProperty = new PropertyInfo({
      user_id: user,
      property_name,
      property_email,
      property_contact,
      star_rating,
      property_code,
      image,
      property_category,
      property_type,
      description,
    });
    console.log("create Property ", newProperty);
    await newProperty.save();

    res.status(201).json({
      status: "success",
      error: false,
      message: "Property registered successfully",
      data: {
        isHomestayFlow,
        isHotelFlow,
        property: newProperty,
      },
    });
  }
);

const updatePropertyInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertInfoId = req.params.id;
    const {
      property_name,
      property_email,
      property_contact,
      star_rating,
      property_code,
      image,
      description,
    } = req.body;

    const property = await PropertyInfo.findById(propertInfoId);

    if (!property) {
      return next(
        new AppError(`No property found with this id ${propertInfoId}`, 404)
      );
    }

    const updateProperty = await PropertyInfo.findByIdAndUpdate(
      propertInfoId,
      {
        $set: {
          property_name,
          property_email,
          property_contact,
          star_rating,
          property_code,
          image,
          description,
        }
      },
      { new: true }
    );
    
    return res.status(200).json({
      status: "success",
      error: false,
      message: "Property updated successfully",
      data: updateProperty,
    });
  }
);

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const propertyInfoId = req.params.id;  // property id

  const property = await PropertyInfo.findById(propertyInfoId);
  if (!property) {
    return next(new AppError(`No property found with this id ${property}`, 404));
  }

  await Promise.all([
    PropertyAddress.findByIdAndDelete(property?.property_address),
    propertyAminity.findByIdAndDelete(property?.property_amenities),
    RoomAminity.findByIdAndDelete(property?.room_Aminity),
    PropertyPrice.findByIdAndDelete(property?.rate_plan),
    // PropertyType.findByIdAndDelete(property?.property_type),
    // PropertyCategory.findByIdAndDelete(property?.property_category),
  ]);
  await PropertyInfo.findByIdAndDelete(propertyInfoId);

  res.status(200).json({
    status: "success",
    error: false,
    message: "Property deleted successfully",
    data: null,
  });
}
);

const getPropertyInfoById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    const property = await PropertyInfo.findById(propertyId)
      .populate({ path: "property_category" })
      .populate({ path: "property_address" })
      .populate({ path: "property_amenities" })
      .populate({ path: "property_room" })
      .populate({ path: "room_Aminity" })
      .populate({ path: "rate_plan" })
      .lean();

    // const rateplan = await PropertyRatePlan.findById(property?.rate_plan)
    //   .populate({ path: "applicable_room_type" })
    //   .select("-total_room -floor -room_view -room_size -room_unit -smoking_policy -max_occupancy -max_number_of_adults -max_number_of_children -number_of_bedrooms -number_of_living_room -extra_bed -description -image -__v")
    //   .lean();

    const rateplan = await PropertyRatePlan.aggregate([
      { $match: { property_id: new mongoose.Types.ObjectId(propertyId) } },

      {
        $lookup: {
          from: 'rooms', // The collection to join
          localField: 'applicable_room_type', // The field from the input documents
          foreignField: '_id', // The field from the documents of the "from" collection
          as: 'applicable_room_type'
        }
      },
      { $unwind: '$applicable_room_type' },

      {
        $project: {
          applicable_room: '$applicable_room_type.room_name',
          applicable_room_type: '$applicable_room_type.room_type',
          propertyInfo_id: '$applicable_room_type.propertyInfo_id',
          _id: 1,
          meal_plan: 1,
          room_price: 1,
          rate_plan_name: 1,
          rate_plan_description: 1,
          min_length_stay: 1,
          max_length_stay: 1,
          min_book_advance: 1,
          max_book_advance: 1,
        }
      }
    ])

    // const property = await PropertyInfo.aggregate([
    //   { $match: { _id: new mongoose.Types.ObjectId(propertyId) } },

    //   {
    //     $lookup: {
    //       from: 'propertycategories', // The collection to join
    //       localField: 'property_category', // The field from the input documents
    //       foreignField: '_id', // The field from the documents of the "from" collection
    //       as: 'property_category'
    //     }
    //   },
    //   { $unwind: '$property_category' },  // Unwind the array to get a single object

    //   {
    //     $lookup: {
    //       from: 'propertyaddresses', // The collection to join
    //       localField: 'property_address', // The field from the input documents
    //       foreignField: '_id', // The field from the documents of the "from" collection
    //       as: 'property_address'
    //     }
    //   },
    //   { $unwind: '$property_address' },  // Unwind the array to get a single object

    //   {
    //     $lookup: {
    //       from: 'rateplans', // The collection to join
    //       localField: 'rate_plan', // The field from the input documents
    //       foreignField: '_id', // The field from the documents of the "from" collection
    //       as: 'rate_plan'
    //     }
    //   },
    //   { $unwind: '$rate_plan' },  // Unwind the array to get a single object

    // ])
    // console.log("property: ", property);

    const properties = {
      ...property,
      rate_plan: rateplan
    }

    if (!properties) {
      return next(
        new AppError(`No property found with this id ${propertyId}`, 404)
      );
    }

    res.status(200).json({
      status: "success",
      error: false,
      message: "Property fetched successfully",
      data: properties,
    });
  }
);

const getAllProperty = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  const deToken = await decodeToken(
    token as any,
    process.env.JWT_SECRET_KEY as any
  );

  const properties = await PropertyInfo.find({ user_Id: deToken.id });

  res.status(200).json({
    status: "success",
    error: false,
    message: "Property fetched successfully",
    totalProperty: properties.length,
    data: properties,
  });
});

const getProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const property = await PropertyInfo.find();

    if (!property) {
      return next(new AppError(`No property found with this id `, 404));
    }

    res.status(200).json({
      status: "success",
      error: false,
      message: "Property  fetched successfully",
      length: property.length,
      data: property
    });
  }
);

export {
  createpropertyInfo,
  updatePropertyInfo,
  deleteProperty,
  getPropertyInfoById,
  getAllProperty,
  getMyProperties,
  getProperties,
};
