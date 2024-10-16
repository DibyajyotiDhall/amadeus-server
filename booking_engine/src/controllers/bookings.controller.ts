import { Request, Response, NextFunction } from "express";
import Bookings from "../models/booking.model";
import { validateBookingDates } from "../utils/booking.validator.dates";
import mongoose, { Types } from "mongoose";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import AuthModel from "../../../authentication/src/model/auth.model"
import Auth from "../../../authentication/src/model/auth.model";
import { PropertyInfo } from "../../../pms_api/src/model/property.info.model";
import { Room } from "../../../pms_api/src/model/room.model";
import { checkPreferences } from "joi";

export const createReservation = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
    const {
      room,
      user,
      booking_user_name,
      booking_user_email,
      booking_user_phone,
      property,
      amount,
      booking_dates,
      payment,
      status,
      checkInDate,
      checkOutDate,
    } = req.body;

    const id = req.user;

    // Validate check-in and check-out dates
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0];

    if (
      new Date(checkInDate).toISOString().split("T")[0] < formattedCurrentDate ||
      new Date(checkOutDate).toISOString().split("T")[0] < formattedCurrentDate
    ) {
      return res.status(400).json({
        message: "Check-in and check-out dates must be in the future",
      });
    }

    // Validate check-in date is before check-out date
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      return res
        .status(400)
        .json({ message: "Check-in date must be before check-out date" });
    }

    // Validate booking dates
    if (
      !booking_dates ||
      new Date(booking_dates).toISOString().split("T")[0] < formattedCurrentDate
    ) {
      return res.status(400).json({
        message: "Booking date must be current or in the future",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const owner_id = await PropertyInfo.findOne({ _id: property })
        .select({ user_id: 1 })
        .session(session);

      const newReservation = new Bookings({
        owner_id: owner_id?.user_id,
        room,
        user,
        booking_user_name,
        booking_user_email,
        booking_user_phone,
        property,
        amount,
        booking_dates,
        payment,
        status,
        checkInDate,
        checkOutDate,
      });

      const savedBooking = await newReservation.save({ session });

      // Update both the user's bookings and room availability in parallel
      const [bookingsForUser, updatedRoom] = await Promise.all([
        AuthModel.findByIdAndUpdate(
          { _id: id },
          { $push: { bookings: savedBooking._id } },
          { new: true, session }
        ),
        Room.findByIdAndUpdate(
          { _id: room },
          { $inc: { available_rooms: -1 } },
          { new: true, session }
        ),
      ]);

      await session.commitTransaction();
      session.endSession();

      // const bookingsForUser = await AuthModel.findByIdAndUpdate({ _id: id }, {
      //   $push: {
      //     bookings: savedBooking._id
      //   }
      // })

      // if (savedBooking) {
      //   const bookingsForUser = await AuthModel.findByIdAndUpdate({ _id: id }, {
      //     $push: {
      //       bookings: savedBooking._id
      //     }
      //   })
      //   const updateNumberOfRoomsAvailable = await Room.findByIdAndUpdate({ _id: room },
      //     { $inc: { total_room: -1 } },
      //     { new: true }
      //   )
      // }

      res.status(201).json({
        success: true,
        savedBooking,
        bookingsForUser
      });
    }
    catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      console.log(error.message);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateReservation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservationId = req.params.id;
      const updateFields = req.body;

      const updatedReservation = await Bookings.findByIdAndUpdate(
        reservationId,
        { $set: updateFields },
        { new: true }
      );

      if (!updatedReservation) {
        return next(new ErrorHandler("Reservation not found", 404));
      }

      res.json(updatedReservation);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getReservation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservationId = req.params.reservationId;
      console.log("Requested Reservation ID:", reservationId);

      const reservation = await Bookings.findById(reservationId);
      console.log("Retrieved Reservation:", reservation);

      if (!reservation) {
        return next(new ErrorHandler("Reservation not found", 404));
      }

      res.json(reservation);
    } catch (error: any) {
      console.error("Error getting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllReservations = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch all reservations from the database
      const reservations = await Bookings.find();

      // Check if there are no reservations
      if (!reservations || reservations.length === 0) {
        return res.status(404).json({
          message: "No reservations found",
        });
      }

      // Return the list of reservations
      res.json({
        length: reservations.length,
        reservations,
      });
    } catch (error: any) {
      console.error("Error getting all reservations:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllReservationsOfUser = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userID = req.params.id;

      const user_reservations = await Auth.findById(userID)
      const populatedBookings = await Bookings.find({ _id: { $in: user_reservations?.bookings } })
        .populate({ path: "room" })
        .populate({ path: "property" })
        .populate({ path: "user" })

      return res.json({
        // bookings: user_reservations?.bookings
        bookings: populatedBookings
      })

    } catch (error: any) {
      console.error("Error getting all reservations of User:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const deleteReservation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bookingId = req.params.id;

      const deletedReservation = await Bookings.findByIdAndDelete(bookingId)
        .session(session)
        .lean();

      if (!deletedReservation) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Reservation not found", 404));
      }

      const [updateUserBooking, updateRoomAvailability] = await Promise.all([
        AuthModel.findOneAndUpdate(
          { bookings: bookingId },
          { $pull: { bookings: bookingId } },
          { new: true }
        ).session(session).lean(),

        Room.findByIdAndUpdate(
          deletedReservation.room,
          { $inc: { available_rooms: 1 } },
          { new: true }
        ).session(session).lean(),
      ]);

      if (!updateRoomAvailability) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Room not found or failed to update", 404));
      }

      await session.commitTransaction();
      session.endSession();

      // const deleteBookingIdAtUserModel = await AuthModel.findOneAndUpdate(
      //   { bookings: bookingId },
      //   { $pull: { bookings: bookingId } }, // Use $pull to remove the specific booking ID from the array
      //   { new: true } // Optionally return the updated document
      // );

      res.json({
        success: true,
        message: "Reservation deleted successfully",
        userId: updateUserBooking?._id,
      });
    }
    catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error deleting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getReservationByRoom = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = req.params.id;
      const reservations = await Bookings.find({ room: roomId });

      res.json({
        success: true,
        length: reservations.length,
        reservations
      });
    } catch (error: any) {
      console.log("Error getting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
)


export const getBookingsForDashboard = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isValidUser = await AuthModel.findById(req.params.id);

      if (!isValidUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      const bookings = await Bookings.aggregate([
        {
          $match: {
            owner_id: new Types.ObjectId(req.params.id)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "propertyinfos",
            localField: "property",
            foreignField: "_id",
            as: "property"
          }
        },
        {
          $lookup: {
            from: "rooms",
            localField: "room",
            foreignField: "_id",
            as: "room"
          }
        },
        {
          $unwind: "$property"
        },
        {
          $unwind: "$room"
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            property_name: "$property.property_name",
            room_name: "$room.room_name",
            room_type: "$room.room_type",
            amount: 1,
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            email: "$user.email",
            checkInDate: 1,
            checkOutDate: 1,
            status: 1
          }
        },
      ])

      return res.json({
        success: true,
        length: bookings.length,
        bookings
      })

    } catch (error: any) {
      console.log("Error getting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
)

export const updateStatusOfBooking = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookingId = req.params.id;
      const { status } = req.body;

      console.log("bookingId ---> ", bookingId);
      console.log("newStatus ---> ", status);

      const updatedBooking = await Bookings.findByIdAndUpdate(
        bookingId,
        { status: status },
        { new: true }
      );

      if (!updatedBooking) {
        return next(new ErrorHandler("Booking not found", 404));
      }

      console.log("status ---> ", updatedBooking.status);

      return res.json({
        success: true,
        updatedStatus: updatedBooking.status
      });

    } catch (error: any) {
      console.log("Error updating booking status:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
)

export const countBookings = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner_id = req.params.id;

      const count = await Bookings.countDocuments({ owner_id });
      // const pendingCount = await Bookings.countDocuments({ status: "pending", owner_id });


      const result = await Bookings.aggregate([
        { $match: { owner_id: new Types.ObjectId(owner_id) } }, 
        {
          $group: {
            _id: null, // Grouping all documents together
            totalBookings: { $sum: 1 }, // Count total number of bookings
            pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }, // Count pending status
            approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }, // Count approved status
            cancelCount: { $sum: { $cond: [{ $eq: ['$status', 'cancel'] }, 1, 0] } }, // Count approved status
            completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, // Count approved status
            totalSales: { $sum: '$amount' } // Sum the amount field
          }
        },
        {
          $project: {
            _id: 0, // Exclude the _id field
            totalBookings: 1,
            totalSales: 1,
            pendingCount: 1,
            approvedCount: 1,
            cancelCount: 1,
            completedCount: 1,
          }
        }
      ]);

      // const totalBookings = count > 0 ? count : 0;
      // const totalSales = result.length > 0 ? result[0].totalSales : 0; 

      return res.json({
        success: true,
        result,
        // totalBookings,
        // totalSales,
      });
    } catch (error: any) {
      console.log("Error counting bookings:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
)