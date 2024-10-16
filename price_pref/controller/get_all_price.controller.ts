import Price from "../model/price.model";
import { Request, Response } from "express";

export const getAllPrice = async (req: any, res: Response) => {
    try {        
        const priceList = await Price.find({ owner_id: req.user });

        if (!priceList) {
            return res.status(401).json({
                success: false,
                message: "No price data found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Price list fetched successfully",
            priceList: priceList
        })
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error while fetching price, please try again later"
        })
    }
}