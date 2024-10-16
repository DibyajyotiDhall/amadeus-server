import { Router } from "express";
// import { search } from "../../controllers/search.controllers";
import { search,searchAmenities } from "../controllers/search.controllers";

const router: Router = Router();

// Define a route for user registration
router.post("/", search);
router.post("/search-amenities", searchAmenities);


// deleteEquipmentCategory
export default router;
