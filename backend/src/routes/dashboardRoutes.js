const express = require("express");

const {
    getStudentDashboard,
    getFacultyDashboard,
    getAdminDashboard
} = require("../controllers/dashboardController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Student dashboard
router.get(
    "/student",
    protect,
    authorize("student"),
    getStudentDashboard
);


// Faculty dashboard
router.get(
    "/faculty",
    protect,
    authorize("faculty"),
    getFacultyDashboard
);


// Admin dashboard
router.get(
    "/admin",
    protect,
    authorize("admin"),
    getAdminDashboard
);


module.exports = router;