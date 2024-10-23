import { Schema, model, Document } from "mongoose";

interface IOrder extends Document {
  id: string;
  amount: number;
  currency: string;
  orderId: string;
  createdAt: Date;
  updateAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    orderId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Order = model<IOrder>("Order", orderSchema);

export default Order;
