import mongoose, { Document, Schema, Types } from "mongoose";
import { PropertyAddressType } from "../model/property.address.model";
import { RoomType } from "../model/room.model";
import { UserType } from "./user.model";
import { Category, PropertyCategory } from "./propertycategory.model";
import { PropertyAmenitiesType } from "./propertyamenite.model";
import { RoomAminity, RoomAminityType } from "./room.amenite.model";
import { RatePlan } from "./ratePlan.model";

interface PropertyInfoType extends Document {
  user_id: Types.ObjectId | UserType;
  property_name: string;
  property_email: string;
  property_contact: string;
  star_rating: mongoose.Types.Decimal128;
  property_code: string;
  property_address: Types.ObjectId | PropertyAddressType;
  property_amenities: Types.ObjectId | PropertyAmenitiesType;
  property_room: Types.ObjectId[] | RoomType;
  room_Aminity: Types.ObjectId | RoomAminityType;
  image: string[];
  description: string;
  property_category: Types.ObjectId | PropertyCategory;
  property_type: Types.ObjectId;
  isDraft: boolean;
  rate_plan:  Types.ObjectId | RatePlan;
}

const propertyInfoSchema = new Schema<PropertyInfoType>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  property_name: { type: String, required: true },
  property_email: { type: String, required: true },
  property_contact: { type: String, required: true },
  star_rating: { type: String, required: true },
  property_code: { type: String, required: true },
  property_address: { type: Schema.Types.ObjectId, ref: "PropertyAddress" },
  property_amenities: { type: Schema.Types.ObjectId, ref: "propertyAminity" },
  property_category:{type:Schema.Types.ObjectId,ref:"PropertyCategory"},
  property_type: { type: Schema.Types.ObjectId, ref: "PropertyType", required: [true, "Property type is required"], },
  property_room: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  room_Aminity: { type: Schema.Types.ObjectId, ref: "RoomAminity" },
  image: [{ type: String }],
  description: { type: String },
  isDraft: { type: Boolean, default: true, },
  rate_plan: [{ type: Schema.Types.ObjectId, ref: "RatePlan" }]
});

const PropertyInfo = mongoose.model<PropertyInfoType>( "PropertyInfo", propertyInfoSchema );

export { PropertyInfo, PropertyInfoType };
