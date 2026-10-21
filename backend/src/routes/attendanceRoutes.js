const express = require("express");

const {
    markAttendance,
    markBulkAttendance,
    getFacultyAttendance,
    getAttendance,
    getMyAttendanceSummary,
    getMyAttendance
} = require("../controllers/attendanceController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Faculty marks attendance
router.post(
    "/",
    protect,
    authorize("faculty"),
    markAttendance
);
router.post(
    "/bulk",
    protect,
    authorize("faculty"),
    markBulkAttendance
);
router.get(
    "/faculty",
    protect,
    authorize("faculty"),
    getFacultyAttendance
);

router.get(
    "/my/summary",
    protect,
    authorize("student"),
    getMyAttendanceSummary
);
// Admin and faculty can view all attendance
router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    getAttendance
);


// Student can view own attendance
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyAttendance
);


module.exports = router;