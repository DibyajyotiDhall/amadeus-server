import { Request, Response } from "express";
import axios from "axios";
// import { fetchClientCredentials } from "../lib/amadeus";
import { getAccessToken } from "../../amadeus/utils/amadeus.auth";

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
