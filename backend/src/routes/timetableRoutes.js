const express = require("express");

const {
    createTimetable,
    getTimetable,
    getMyTimetable,
    getFacultyTimetable,
    updateTimetable,
    deleteTimetable
} = require("../controllers/timetableController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Admin creates timetable
router.post(
    "/",
    protect,
    authorize("admin"),
    createTimetable
);


// Admin, faculty and students can view all timetable entries
router.get(
    "/",
    protect,
    authorize("admin", "faculty", "student"),
    getTimetable
);


// Student views own timetable
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyTimetable
);


// Faculty views own timetable
router.get(
    "/faculty",
    protect,
    authorize("faculty"),
    getFacultyTimetable
);


// Admin updates timetable
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateTimetable
);


// Admin deletes timetable
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteTimetable
);


module.exports = router;