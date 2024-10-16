import Auth from "../../authentication/src/model/auth.model"
import { PropertyInfo } from "../../pms_api/src/model/property.info.model"
import Price from "../model/price.model"
import { NextFunction, Request, Response } from "express"

export async function createPrice(req: any, res: Response, next: NextFunction) {
    try {
        // const {id} = req.params
        // console.log(id)
        const { adultPrice, childrenPrice, breakfastPrice, lunchPrice, dinnerPrice, price_category, room_base_price } = req.body

        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: "Owner ID is required"
            })
        }

        if ( !adultPrice || !childrenPrice || !breakfastPrice || !lunchPrice || !dinnerPrice || !room_base_price ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const CP = room_base_price + breakfastPrice;
        const MAP = room_base_price + breakfastPrice + dinnerPrice;
        const AP = room_base_price + breakfastPrice + dinnerPrice + lunchPrice;
        const EP = room_base_price;

        const newPriceList = await Price.create({
            owner_id: req.user, 
            price_category, adultPrice, 
            childrenPrice, breakfastPrice, 
            lunchPrice, dinnerPrice, room_base_price, CP, MAP, AP, EP
        })

        if (!newPriceList) {
            return res.status(400).json({
                success: false,
                message: "Unable to create price, please try again after sometimes"
            })
        }

        const owner_info = await Auth.findOneAndUpdate({_id: req.user}, {
            rate_plan: newPriceList._id
        })

        // const property_info = await PropertyInfo.findByIdAndUpdate({}, {
        //     rate_plan: newPriceList._id,
        // }, { new: true });

        if (!owner_info) {
            return res.status(400).json({
                success: false,
                message: "Unable to create price, please try again after sometimes"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Price list created",
            priceList: newPriceList
        })
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error, please try again"
        })
    }    
}