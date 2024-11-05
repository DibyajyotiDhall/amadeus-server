import express from "express";
import { getAirlinesByLocationAndInsert, getLocations } from "../controllers/location.controller";

const router = express.Router();

router.get("/", getLocations);

// test purpose
router.get("/test", getAirlinesByLocationAndInsert)

export default router;
