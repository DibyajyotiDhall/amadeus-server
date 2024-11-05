import { Request, Response } from "express";
import axios from "axios";
// import { fetchClientCredentials } from "../lib/amadeus";
import { getAccessToken } from "../../amadeus/utils/amadeus.auth";
import Airline from "../models/airline.model"; // Assuming Location model is in models folder

export async function getLocations(req: Request, res: Response) {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({
            success: false,
            message: "Keyword query parameter is required",
        });
    }

    try {
        const token = await getAccessToken();

        const response = await axios.get(
            `${process.env.AMADEUS_API_URL}/v1/reference-data/locations`,
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

        return res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching locations",
            error: error.response?.data.errors,
        });
    }
}





//  Test purpose
export async function getAirlinesByLocationAndInsert(req: Request, res: Response) {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({
            success: false,
            message: "Keyword query parameter is required",
        });
    }

    try {
        const token = await getAccessToken();

        const response = await axios.get(
            `${process.env.AMADEUS_API_URL}/v1/reference-data/locations`,
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

        const locations = response.data.data;

        // Use Promise.all for concurrent upsert operations
        await Promise.all(
            locations.map(location =>
                Airline.findOneAndUpdate(
                    { id: location.id },   // Find by unique identifier
                    location,              // Use location data for update
                    { upsert: true, new: true }  // Upsert option
                )
            )
        );

        return res.status(200).json({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching locations",
            error: error.response?.data.errors,
        });
    }
}
