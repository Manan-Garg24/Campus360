const express = require("express");

const {
    createComplaint,
    getMyComplaints,
    getComplaints,
    updateComplaint,
    deleteComplaint
} = require("../controllers/complaintController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Student
router.post(
    "/",
    protect,
    authorize("student"),
    createComplaint
);


// Student
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyComplaints
);


// Admin
router.get(
    "/",
    protect,
    authorize("admin"),
    getComplaints
);


// Admin
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateComplaint
);


// Admin
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteComplaint
);


module.exports = router;