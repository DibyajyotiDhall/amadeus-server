import { Router } from "express";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRooms,
  getRoomsByPropertyId,
  getRoomsForBooking,
} from "../../controller/room.controller";

const router = Router();

export default (app: Router) => {
  app.use("/room", router);

  router.route("/rooms_by_propertyId/:id").get(getRoomsByPropertyId as any);
  router.route("/getRoomsForBooking/:id").get(getRoomsForBooking as any);

  router
    .route("/")
    .get(getRooms as any)
    .post(createRoom as any);

  router
    .route("/:id")
    .get(getRoomById as any)
    .post(createRoom as any)
    .patch(updateRoom as any)
    .delete(deleteRoom as any);
};
