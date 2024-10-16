import { Types } from "mongoose";

export type BookingsType = {
  owner_id: Types.ObjectId;
  property: Types.ObjectId;
  room: Types.ObjectId;
  user: Types.ObjectId;
  booking_user_name:string
  booking_user_email:string,
  booking_user_phone:Number,
  amount: Number;
  payment: Types.ObjectId;
  booking_dates: Date;
  status: string;
  checkInDate: Date;
  checkOutDate: Date;
  reviews: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
