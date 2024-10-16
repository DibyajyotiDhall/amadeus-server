import { Router } from "express";
import {
  createpropertyInfo,
  getAllProperty,
  getPropertyInfoById,
  updatePropertyInfo,
  deleteProperty,
  getMyProperties,
  getProperties,
} from "../../controller/propertyInfo.controller";
import {
  createPropertyAddress,
  updatePropertyAddress,
  deletePropertyAddress,
  getPropertyAddressById,
  updatePropertyAddressBypropertyid,
} from "../../controller/propertyaddress.controller";

// import { protect } from "@quotus_packages/auth_middleware";
import { createPaymentMethod } from "../../controller/property/paymentmethod.controller";
import { protect } from "../../../../authentication/src/middleware/auth.middleware"
import { createPropertyCategory, getAllPropertyCategories, getPropertyCategory, } from "../../controller/propertycategory.controller";
import { createPropertyType, getPropertyTypes } from "../../controller/propertytype.controller";
import { updatePropertyAmenity, createAminity } from "../../controller/propertyamenity.controller";
import { createRoomRatePlan, updateRoomRatePlan, getRoomRatePlan, deleteRoomRatePlan, getAllRatePlans } from "../../controller/ratePlan.controller";
import { getAllPropertiesOfCategory } from "../../controller/propertyByCategory.controller";

const router = Router();

export default (app: Router) => {

  app.use("/property", router);
  router.route("/me").get(protect as any, getMyProperties as any);

  // get all property rateplans
  router.route("/getRateplan/:id").get(protect as any, getAllRatePlans as any)

  // property category
  router
    .route("/category")
    .get(getAllPropertyCategories as any)
    .post(protect as any, createPropertyCategory as any);

  router.route("/property-category").get(getAllPropertiesOfCategory as any)
  router.route("/category/:propertyCategoryID").get(getPropertyCategory as any);

  // property type
  router
    .route("/type")
    .post(protect as any, createPropertyType as any)
    .get(getPropertyTypes as any);

  // property payment router
  router
    .route("/payment_method")
    .post(protect as any, createPaymentMethod as any);

  // property address router
  router.route("/address").post(protect as any, createPropertyAddress as any);
  router
    .route("/address/:id")
    .get(getPropertyAddressById as any)
    .patch(protect as any, updatePropertyAddress as any)
    .delete(protect as any, deletePropertyAddress as any);

  router
    .route("/addressbyid/:id")
    .patch(protect as any, updatePropertyAddressBypropertyid as any);

  // // property aminites router
  router
    .route("/amenities")
    .post(protect as any, createAminity as any);
    //.post(protect as any, createPropertyAmeniteCategory as any);
  // router.route("/amenities/:id").get(getPropertyAmeniteCategory as any);
  // router.route("/allamenities").get(getPropertyAminitesategories as any);
  // router.route("/destination").get(getDestinationType as any);

  // property router
  router.route("/properties").get(getProperties as any);

  router
    .route("/")
    .get(getAllProperty as any)
    .post(protect as any, createpropertyInfo as any);
    
  router
    .route("/:id")
    .get(getPropertyInfoById as any)
    .patch(protect as any, updatePropertyInfo as any)
    .delete(protect as any, deleteProperty as any);

  router
    .route("/Aminity/:id")
    .patch(protect as any, updatePropertyAmenity as any);

  router
    .route("/price/:id")
    .post(protect as any, createRoomRatePlan as any)
    .patch(protect as any, updateRoomRatePlan as any)
    .get(getRoomRatePlan as any)
    .delete(protect as any, deleteRoomRatePlan as any);

};
