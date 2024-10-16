import { Router } from "express";
import {
  createReservation,
  getAllReservations,
  getReservation,
  updateReservation,
  getAllReservationsOfUser,
  getReservationByRoom,
  deleteReservation,
  getBookingsForDashboard,
  updateStatusOfBooking,
  countBookings
} from "../controllers/bookings.controller";

import { protect } from "../../../authentication/src/middleware/auth.middleware"

const router = Router();

router.route("/createreservation").post(protect as any, createReservation);
router.route("/update/:id").patch(protect as any, updateStatusOfBooking);
router.route("/getreservation/:reservationId").get(getReservation);
router.route("/getreservations").get(getAllReservations);
router.route("/getUserReservations/:id").get(getAllReservationsOfUser);

router.route("/:id")
  .get(protect as any, getBookingsForDashboard)
  .delete(protect as any, deleteReservation);
  
router.route("/room/:id").get(protect as any, getReservationByRoom);

router.route("/count/:id").get(protect as any, countBookings);  // get count of bookings of manager

export default router;
