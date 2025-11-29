import { Router } from 'express';
import { getAllInfo } from "../controllers/adminController.js";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.js";

const adminRoutes = Router();

// /api/admin/info
adminRoutes.get("/info", verifyTokenAndAdmin, getAllInfo);

export default adminRoutes;
