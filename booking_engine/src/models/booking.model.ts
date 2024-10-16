import { Model, Schema, model, Document } from "mongoose";
import { validateBookingDates } from "../utils/booking.validator.dates";
import { BookingsType } from "../../types";

interface IBooking extends BookingsType, Document {}

type BookingsModelType = Model<IBooking>;

const bookingSchema = new Schema<BookingsType>({
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: [true, "Room id is required field"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User id is required field"],
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: "PropertyInfo",
    required: [true, "property id is required "],
  },

  owner_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Owner id is required field"],
  },

  booking_user_name:{
    type:String,
  },
  booking_user_email:{
    type:String,
  },
  booking_user_phone:{
    type:Number
  },

  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  booking_dates: {
    type: Date,
    required: [true, "Booking `booking_dates` is required field"],
  },
  payment: {
    type: Schema.Types.ObjectId,
  },
  status: {
    type: String,
    default: "pending",
    enum: [
      "pending",
      "cancel",
      "approved",
      "rejected",
      "in-reviews",
      "completed",
    ],
    required: [true, "Room status is required field."],
  },
  checkInDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value: { toISOString: () => string }) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value.toISOString().split("T")[0]);
      },
      message: "Invalid date format for check-in date",
    },
  },
  checkOutDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value: { toISOString: () => string }) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value.toISOString().split("T")[0]);
      },
      message: "Invalid date format for check-out date",
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// updatedAt' field before saving or updating a document
bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const   Bookings = model<BookingsType, BookingsModelType>(
  "Bookings",
  bookingSchema
);

export default Bookings;
