import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { AuthType } from "../../authentication/src/model/auth.model";

export interface ServiceCost extends Document {
    owner_id: Types.ObjectId | AuthType,
    price_category: string,
    adultPrice: number,
    childrenPrice: number,
    breakfastPrice: number,
    lunchPrice: number,
    dinnerPrice: number,
    room_base_price: number,
    CP: number,
    MAP: number,
    AP: number,
    EP: number,
    // totalPrice: number,
}

const serviceCostModel: Schema<ServiceCost> = new Schema<ServiceCost>(
    {
        owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        price_category: { type: String, default: "Regular" },
        adultPrice: { type: Number, default: 300, },
        childrenPrice: { type: Number, default: 200 },
        breakfastPrice: { type: Number, default: 50 },
        lunchPrice: { type: Number, default: 100 },
        dinnerPrice: { type: Number, default: 100 },
        // totalPrice: { type: Number, default: 0 },
        room_base_price: { type: Number, required: true, default: 0 },
        CP: { type: Number, default: 0 },
        MAP: { type: Number, default: 0 },
        AP: { type: Number, default: 0 },
        EP: { type: Number, default: 0 },
    },
    // {
    //     owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    //     price_category: { type: String, default: "Regular" },
    //     adult_price: { type: Number, default: 800, },
    //     children_price: { type: Number, default: 400 },
    //     breakfast_price: { type: Number, default: 100 },
    //     lunch_price: { type: Number, default: 200 },
    //     dinner_price: { type: Number, default: 200 },
    //     CP: { type: Number, default: 0 },   // Bed + breakfast
    //     MAP: { type: Number, default: 0 },  // Bed + breakfast + dinner
    //     AP: { type: Number, default: 0 },   // Bed + breakfast + dinner + lunch
    //     EP: { type: Number, default: 0 },   // Bed
    //     // total_price: { type: Number, default: 0 },
    // },
    { timestamps: true }
)

const Price: Model<ServiceCost> = mongoose.model<ServiceCost>('Price', serviceCostModel);
export default Price;