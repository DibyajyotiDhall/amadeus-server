import { Router } from "express";
import { getFlightOffers, getFlightPricing } from "../controllers/flight.controller";

const router = Router();

router.get("/flight-offers", getFlightOffers);
router.post("/flight-offers/pricing", getFlightPricing);

export default router;
