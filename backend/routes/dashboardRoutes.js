const express = require('express')
const { Protect } = require('../middlewares/authMiddleware');
const { getDashboardData } = require('../controllers/dashboardController')

const router = express.Router();

router.get("/", Protect, getDashboardData);

module.exports = router;