import { Router } from "express";
import {
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
} from "../controller/user/user.controller";
import { protect } from "../../../authentication/src/middleware/auth.middleware";

const router = Router();

router.route("/").get(getAllUsers as any);

router
  .route("/:id")
  .put(protect as any, updateUser as any)
  .delete(protect as any, deleteUser as any)
  .get(getUserById as any);

export default router;
