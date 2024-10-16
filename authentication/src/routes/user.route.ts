import { Router } from "express";
import { getMe ,updateProfile} from "../controller/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();
//console.log("user router")
router.route("/me").get(protect as any, getMe as any);
// router.route("/me").get(protect as any, getMe as any);

router.route("/update").patch(protect as any ,updateProfile as any)
export default router;
