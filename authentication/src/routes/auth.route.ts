import { Router } from "express";
import { register, login,logout } from "../controller/auth.controller";

const router = Router();

router.route("/register").post(register as any);

router.route("/login").post(login as any);

router.route("/logout").post(logout as any)
export default router;
