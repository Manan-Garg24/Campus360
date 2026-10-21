const express = require("express");

const {
    createAssignment,
    getAssignments,
    getMyAssignments,
    updateAssignment,
    deleteAssignment
} = require("../controllers/assignmentController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Faculty creates assignment
router.post(
    "/",
    protect,
    authorize("faculty"),
    createAssignment
);


// Admin, faculty and students can view assignments
router.get(
    "/",
    protect,
    authorize("admin", "faculty", "student"),
    getAssignments
);


// Faculty gets their own assignments
router.get(
    "/my",
    protect,
    authorize("faculty"),
    getMyAssignments
);


// Faculty updates assignment
router.put(
    "/:id",
    protect,
    authorize("faculty"),
    updateAssignment
);


// Faculty deletes assignment
router.delete(
    "/:id",
    protect,
    authorize("faculty"),
    deleteAssignment
);


module.exports = router;