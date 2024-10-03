import express from 'express';
import { getDashboardStats, getPieChart, getBarChart, getLineChart} from '../controllers/stats.js';
import { adminOnly } from '../middlewares/auth.js';

const router = express.Router()

router.get("/stats", adminOnly,getDashboardStats)  //  http://localhost:4000/api/v1/dashboard/stats
router.get("/pie", adminOnly,getPieChart)  //  http://localhost:4000/api/v1/dashboard/pie
router.get("/bar",adminOnly, getBarChart)  //  http://localhost:4000/api/v1/dashboard/bar
router.get("/line",adminOnly ,getLineChart )  //  http://localhost:4000/api/v1/dashboard/line

export default router;

