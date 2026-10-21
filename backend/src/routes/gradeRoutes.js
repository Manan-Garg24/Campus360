const express = require("express");

const {
    createGrade,
    getGrades,
    getMyGrades,
    updateGrade,
    deleteGrade
} = require("../controllers/gradeController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Faculty adds grade
router.post(
    "/",
    protect,
    authorize("faculty"),
    createGrade
);


// Admin and faculty can view all grades
router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    getGrades
);


// Student views own grades
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyGrades
);


// Faculty updates grade
router.put(
    "/:id",
    protect,
    authorize("faculty"),
    updateGrade
);


// Faculty deletes grade
router.delete(
    "/:id",
    protect,
    authorize("faculty"),
    deleteGrade
);


module.exports = router;