import { Router } from "express";
import { capturePayment, createFlightOrder } from "../controllers/order.controller";

const router = Router();

router.post("/create", createFlightOrder);
router.post("/paymentCapture", capturePayment);


export default router;
