import { Router } from "express";
import { createPaymentIntent } from "../controller/payment.controller";

const router = Router();

router.route("/create-payment-intent").post(createPaymentIntent);

export default router;