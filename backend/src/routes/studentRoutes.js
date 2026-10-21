const express = require("express");

const {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin creates student
router.post(
    "/",
    protect,
    authorize("admin"),
    createStudent
);

// Admin and faculty view students
router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    getStudents
);

// Admin updates student
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateStudent
);

// Admin deletes student
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteStudent
);

module.exports = router;