import express, { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";

import "dotenv/config";

import Razorpay from "razorpay";

import crypto from "node:crypto";

import { format } from "date-fns";

import cors from "cors";
import morgan from "morgan";
import {
  ClerkExpressRequireAuth,
  LooseAuthProp,
  RequireAuthProp,
  StrictAuthProp,
  WithAuthProp,
} from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import User from "./models/user.model";
import axios, { isAxiosError } from "axios";
import Order from "./models/order.model";
import { app } from "../app";

// const app = express();

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

// app.use(express.json({}));
// app.use(cors());
// app.use(morgan("dev"));

(async () => {
  const connection = await mongoose.connect(
    "mongodb+srv://binayakumar824:i9rHAviQbgzmoAQe@cluster0.yjnn9mr.mongodb.net/flight_booking"
  );

  console.log("Connected to MongoDB", connection.connection.host);
})();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

app.post("/webhook", async (req, res) => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("You need a WEBHOOK_SECRET in your .env");
  }

  // Get the headers and body
  const headers = req.headers;
  const payload = req.body;

  // Get the Svix headers for verification
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.json({
      message: "Error occured -- no svix headers",
      status: 400,
    });

    return;
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Attempt to verify the incoming webhook
  // If successful, the payload will be available from 'evt'
  // If the verification fails, error out and  return error code
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    });
  } catch (err: any) {
    console.log("Error verifying webhook:", err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });

    return;
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  const { id, first_name, last_name, email_addresses } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const newUser = await User.create({
      clerkId: id,
      firstName: first_name,
      lastName: last_name,
      email: email_addresses[0].email_address,
    });

    console.log("New user created", newUser);
  }

  res.status(200).json({
    success: true,
    message: "Webhook received",
  });

  return;
});

// Access Granted Client Credentials
async function fetchClientCredentials() {
  try {
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        client_id: "arovMgZ4mjFSN7aXEZjwC0brfwj7D01D",
        client_secret: "EVG7Ft507fspiu7L",
        grant_type: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("Error fetching client credentials:");
    }
  }
}

// app.use(ClerkExpressRequireAuth());

app.get("/locations", async (req: RequireAuthProp<Request>, res: Response) => {
  const { keyword } = req.query;

  const token = await fetchClientCredentials();

  if (!keyword) {
    res.status(400).json({
      success: false,
      message: "Keyword query parameter is required",
    });

    return;
  }

  try {
    const response = await axios.get(
      "https://test.api.amadeus.com/v1/reference-data/locations",
      {
        params: {
          subType: "CITY,AIRPORT",
          keyword: keyword,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.status(200).json({
      success: true,
      data: response.data,
    });

    return;
  } catch (error) {
    console.error("Error fetching locations:", error);
    if (isAxiosError(error)) {
      res.status(500).json({
        success: false,
        message: "Error fetching locations",
        error: error.response?.data.errors,
      });

      return;
    }
  }
});

app.get(
  "/flight-offers",
  async (req: RequireAuthProp<Request>, res: Response) => {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      travelClass,
      nonStop,
      includedAirlineCodes
    } = req.query;

    if (
      !originLocationCode ||
      !destinationLocationCode ||
      !departureDate ||
      !adults
    ) {
      res.status(400).json({
        success: false,
        message:
          "Required query parameters: originLocationCode, destinationLocationCode, departureDate, adults",
      });

      return;
    }

    console.log("Query params", req.query);

    const token = await fetchClientCredentials();

    const departureDateIST = new Date(departureDate as string).toLocaleString(
      "en-US",
      { timeZone: "Asia/Kolkata" }
    );

    const formattedDepartureDate = format(
      new Date(departureDateIST),
      "yyyy-MM-dd"
    );

    console.log("Formatted departure date", formattedDepartureDate);

    const formattedReturnDate = returnDate
      ? format(new Date(returnDate as string), "yyyy-mm-dd")
      : null;

    function filterObject(obj: { [key: string]: any }): { [key: string]: any } {
        return Object.fromEntries(
          Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null && value !== "")
        );
      }

    try {
      const response = await axios.get(
        "https://test.api.amadeus.com/v2/shopping/flight-offers",
        {
          params: filterObject({
            currencyCode: "INR",
            originLocationCode,
            destinationLocationCode,
            departureDate: formattedDepartureDate,
            returnDate,
            adults,
            children,
            travelClass: travelClass || "ECONOMY",
            nonStop,
            includedAirlineCodes: includedAirlineCodes || "",
            max: 5,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      res.status(200).json({
        success: true,
        data: response.data,
      });

      return;
    } catch (error) {
      // console.error("Error fetching locations:", error);
      if (isAxiosError(error)) {
        res.status(500).json({
          success: false,
          message: "Error fetching flight",
          error: error.response?.data.errors,
        });

        return;
      }
    }
  }
);

app.post(
  "/flight-offers/pricing",
  async (req: RequireAuthProp<Request>, res: Response) => {
    const { flightOffers } = req.body;

    if (!flightOffers) {
      res.status(400).json({
        success: false,
        message: "Flight offers data is required",
      });

      return;
    }

    const token = await fetchClientCredentials();

    try {
      const response = await axios.post(
        "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing",
        {
          data: {
            type: "flight-offers-pricing",
            flightOffers,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error("Error fetching flight offer pricing:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching flight offer pricing",
      });
    }
  }
);

app.post(
  "/flight-orders",
  async (req: RequireAuthProp<Request>, res: Response) => {
    const { flightOffers, travelers, remarks, ticketingAgreement, contacts } =
      req.body;

    if (!flightOffers || !travelers || !contacts) {
      res.status(400).json({
        success: false,
        message: "Flight offers, travelers, and contacts data are required",
      });

      return;
    }

    const token = await fetchClientCredentials();

    try {
      const response = await axios.post(
        "https://test.api.amadeus.com/v1/booking/flight-orders",
        {
          data: {
            type: "flight-order",
            flightOffers,
            travelers,
            remarks,
            ticketingAgreement,
            contacts,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error("Error creating flight order:", error);
      res.status(500).json({
        success: false,
        message: "Error creating flight order",
      });
    }
  }
);

app.post("/order", async (req, res) => {
  const { flightOffers, travelers, remarks, ticketingAgreement, contacts } =
    req.body;

  if (!flightOffers || !travelers) {
    res.status(400).json({
      success: false,
      message: "Flight offers, travelers, and contacts data are required",
    });

    return;
  }

  const token = await fetchClientCredentials();

  // try {

  try {
    const orderRes = await axios.post(
      "https://test.api.amadeus.com/v1/booking/flight-orders",
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

    console.log("order res" , orderRes.data)

    // setting up options for razorpay order.
    const options = {
      amount: req.body.amount,
      currency: "INR",
      receipt: "any unique id for every order",
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);

    const order = await Order.create({
      id: response.id,
      amount: response.amount,
      currency: response.currency,
      orderId: response.id,
    });

    console.log("Order created", order);

    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    if (isAxiosError(err)) {
      console.error("Error creating order:", err.response?.data);
    }
    res.status(400).send("Not able to create order. Please try again!");
  }
});

app.post("/paymentCapture", (req, res) => {
  // do a validation

  const data = crypto.createHmac(
    "sha256",
    process.env.RAZORPAY_WEBHOOK_SECRET!
  );

  data.update(JSON.stringify(req.body));

  const digest = data.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");

    //We can send the response and store information in a database.

    console.log(JSON.stringify(req.body));

    res.json({
      status: "ok",
    });
  } else {
    res.status(400).send("Invalid signature");
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
