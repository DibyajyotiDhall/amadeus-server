import Price from "../model/price.model";
import { Request, Response } from "express";
import { ServiceCost } from "../model/price.model";


export const setPreference = async (req: Request<{}, ServiceCost>, res: Response) => {
    const { adult, children, breakfast, lunch, dinner } = req.body;
    // const id = "6669b5e044cf75c2391bfed0"; 
    const { id }: any = req.params;

    try {
        const priceData = await Price.findById(id);

        if (!priceData) {
            return res.status(401).json({
                success: false,
                message: "No price data found"
            })
        }
             
        const totalPrice = priceData.adultPrice * adult +
                    priceData.childrenPrice * children +
                    priceData.breakfastPrice * breakfast +
                    priceData.lunchPrice * lunch +
                    priceData.dinnerPrice * dinner  
                    
        return res.status(200).json({
            success: true,
            message: "Total price is cummulated",
            totalPrice: totalPrice
        })
    } 
    catch (error) {
        console.log("Error: ", error)
        return res.status(500).json({
            success: false,
            message: "Internal error while selecting preferences",
        })
    }
}