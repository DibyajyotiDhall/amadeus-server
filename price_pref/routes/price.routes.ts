import { Router } from "express";
import { createPrice } from "../controller/create_price.controller";
import { setPreference } from "../controller/setPreference.controller";
import { updatePrice } from "../controller/update_price.controller";
import { protect } from "../../authentication/src/middleware/auth.middleware";
import { getAllPrice } from "../controller/get_all_price.controller";
import { deleteRatePlan } from "../controller/delete_rateplan";
import { getPriceById } from "../controller/getPrice.controller";

export const priceRouter = Router();

// console.log("router")

priceRouter.route("/create").post(protect as any, createPrice);
priceRouter
  .route("/preference/:id")
  .get(getPriceById)
  .post(protect as any, setPreference);
priceRouter.route("/update-price/:id").patch(protect as any, updatePrice);
priceRouter.route("/getAll").get(protect as any, getAllPrice);
priceRouter.route("/delete/:id").delete(protect as any, deleteRatePlan);
