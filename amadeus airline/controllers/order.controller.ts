import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { fetchClientCredentials } from "../lib/amadeus";
import { razorpay } from "../lib/razorpay"; // Ensure you have Razorpay setup in this file
import Order from "../models/order.model"; // Adjust according to your model path
import { isAxiosError } from "axios";
import { getAccessToken } from "../../amadeus/utils/amadeus.auth";

export async function createFlightOrder(req: Request, res: Response) {
    const { flightOffers, travelers, amount } = req.body;

    if (!flightOffers || !travelers) {
        return res.status(400).json({
            success: false,
            message: "Flight offers, travelers, and contacts data are required",
        });
    }

    const token = await getAccessToken();
    console.log("Token", token);

    try {
        const orderRes = await axios.post(
            `${process.env.AMADEUS_API_URL}/v1/booking/flight-orders`,
            {
                data: {
                    type: "flight-order",
                    flightOffers,
                    travelers,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("orderRes", orderRes.data);
        // Setting up options for Razorpay order.
        const options = {
            amount: amount, // Ensure amount is passed correctly
            currency: "INR",
            receipt: "any unique id for every order", // Adjust as necessary
            payment_capture: 1,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const order = await Order.create({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.id,
        });

        return res.json({
            order_id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
        });
    } catch (err) {
        if (isAxiosError(err)) {
            console.error("Error creating flight order:", err.response?.data);
        }
        return res.status(400).send("Not able to create order. Please try again!");
    }
}

export function capturePayment(req: Request, res: Response) {
    const data = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!);
    data.update(JSON.stringify(req.body));

    const digest = data.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
        console.log("Request is legit");

        // Handle storing information in the database
        console.log("Payment details:", JSON.stringify(req.body));

        return res.json({
            status: "ok",
        });
    } else {
        return res.status(400).send("Invalid signature");
    }
}
