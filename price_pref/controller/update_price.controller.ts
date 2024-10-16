import Price from "../model/price.model";
import { Request, Response } from "express";

export const updatePrice = async (req: any, res: Response) => {
    try {
        const { adultPrice, childrenPrice, breakfastPrice, lunchPrice, dinnerPrice, price_category, room_base_price } = req.body
        const { id } = req.params;

        const priceList = await Price.findByIdAndUpdate(
            { _id: id }, 
            {
                adultPrice: adultPrice, 
                childrenPrice: childrenPrice, 
                breakfastPrice: breakfastPrice, 
                lunchPrice: lunchPrice, 
                dinnerPrice: dinnerPrice,
                price_category: price_category,
                room_base_price: room_base_price
            },
            { new: true }
        )

        console.log(priceList)
        
        if (!priceList) {
            return res.status(401).json({
                success: false,
                message: "No price data found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Price updated successfully",
            newList: priceList
        })
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error while updating price, please try again later"
        })
    }
}