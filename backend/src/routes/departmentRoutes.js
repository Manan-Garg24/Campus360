const express = require("express");

const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Create department - Admin only
router.post(
    "/",
    protect,
    authorize("admin"),
    createDepartment
);


// Get all departments - Any logged-in user
router.get(
    "/",
    protect,
    getDepartments
);


// Get one department - Any logged-in user
router.get(
    "/:id",
    protect,
    getDepartmentById
);


// Update department - Admin only
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateDepartment
);


// Delete department - Admin only
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteDepartment
);


module.exports = router;