import { Request, Response } from "express";
import axios, { isAxiosError } from "axios";
import { getAccessToken } from "../../amadeus/utils/amadeus.auth";
import { format } from "date-fns";
import { fetchClientCredentials } from "../lib/amadeus";

export const getFlightOffers = async (req: Request, res: Response) => {
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

    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
        return res.status(400).json({ success: false, message: "Missing required query parameters" });
    }

    // const token = await fetchClientCredentials();
    const token = await getAccessToken();

    const departureDateIST = new Date(departureDate as string).toLocaleString(
        "en-US",
        { timeZone: "Asia/Kolkata" }
    );

    const formattedDepartureDate = format(
        new Date(departureDateIST),
        "yyyy-MM-dd"
    );

    function filterObject(obj: { [key: string]: any }): { [key: string]: any } {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null && value !== "")
        );
    }

    try {
        const response = await axios.get(
            `${process.env.AMADEUS_API_URL}/v2/shopping/flight-offers`,
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
                    max: 15,
                }),
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.log("Error fetching flight:", error.response?.data);
        if (isAxiosError(error)) {
            res.status(500).json({
                success: false,
                message: "Error fetching flight",
                error: error.response?.data.errors,
            });

            return;
        }
    }
};


export async function getFlightPricing(req: Request, res: Response) {
    const { flightOffers } = req.body;
  
    if (!flightOffers) {
      return res.status(400).json({success: false, message: "Flight offers data is required"});
    }
  
    const token = await getAccessToken();
  
    try {
      const response = await axios.post(
        `${process.env.AMADEUS_API_URL}/v1/shopping/flight-offers/pricing`,
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
  
      return res.status(200).json({success: true, data: response.data});
    } catch (error) {
      console.error("Error fetching flight offer pricing:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching flight offer pricing",
      });
    }
  }
  
  // export async function createFlightOrder(req: Request, res: Response) {
  //   const { flightOffers, travelers, remarks, ticketingAgreement, contacts } = req.body;
  
  //   if (!flightOffers || !travelers || !contacts) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Flight offers, travelers, and contacts data are required",
  //     });
  //   }
  
  //   const token = await getAccessToken();
  
  //   try {
  //     const response = await axios.post(
  //       `${process.env.AMADEUS_API_URL}/v1/booking/flight-orders`,
  //       {
  //         data: {
  //           type: "flight-order",
  //           flightOffers,
  //           travelers,
  //           remarks,
  //           ticketingAgreement,
  //           contacts,
  //         },
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  
  //     return res.status(200).json({
  //       success: true,
  //       data: response.data,
  //     });
  //   } catch (error) {
  //     console.error("Error creating flight order:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Error creating flight order",
  //     });
  //   }
  // }
  