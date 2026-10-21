const express = require("express");

const {
    createFaculty,
    getFaculty,
    getMyStudents,
    updateFaculty,
    deleteFaculty
} = require("../controllers/facultyController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin creates faculty
router.post(
    "/",
    protect,
    authorize("admin"),
    createFaculty
);

router.get(
    "/my-students",
    protect,
    authorize("faculty"),
    getMyStudents
);
// Admin and faculty can view faculty
router.get(
    "/",
    protect,
    authorize("admin", "faculty"),
    getFaculty
);

// Admin updates faculty
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateFaculty
);

// Admin deletes faculty
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteFaculty
);

module.exports = router;