import { Router } from "express";
import { getHotelsByCity, getHotelById, getMultiHotelOffer, createHotelOrder } from "../controller/hotels.controller";

const router = Router();

router.route("/hotel/:id").get(getHotelById);
router.route("/hotels/by-city/:cityCode").get(getHotelsByCity);
router.route("/shopping-/hotels-offer").get(getMultiHotelOffer);
router.route("/booking/hotels-orders").post(createHotelOrder);
// router.route("/shopping-/hotels-offer/:offerId").get(getOfferPricing);


export default router;