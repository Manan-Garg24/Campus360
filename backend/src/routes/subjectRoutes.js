const express = require("express");

const {
    createSubject,
    getSubjects,
    getMySubjects,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin
router.post(
    "/",
    protect,
    authorize("admin"),
    createSubject
);
router.get(
    "/my",
    protect,
    authorize("faculty"),
    getMySubjects
);
// All authenticated users
router.get(
    "/",
    protect,
    authorize("admin", "faculty", "student"),
    getSubjects
);

// Admin
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateSubject
);

// Admin
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteSubject
);

module.exports = router;