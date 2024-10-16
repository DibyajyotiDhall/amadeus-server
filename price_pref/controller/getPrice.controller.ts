import Price from "../model/price.model";
import { Request, Response } from "express";

export const getPriceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const priceList = await Price.findById(id);

    if (!priceList) {
      return res.status(401).json({
        success: false,
        message: "No price data found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Price list fetched successfully",
      priceList: priceList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal error while fetching price, please try again later",
    });
  }
};
