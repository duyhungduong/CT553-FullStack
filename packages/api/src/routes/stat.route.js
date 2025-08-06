import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getChartData, getStats, getRadarChartData ,getPieChartData} from "../controller/stat.controller.js";

const router = Router();

router.get("/", protectRoute, requireAdmin, getStats);
router.get("/chart-data", getChartData)
router.get("/radar-chart-data", getRadarChartData);
router.get("/pie-chart-data", getPieChartData);

export default router;