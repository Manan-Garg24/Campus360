const express = require("express");

const {
    applyLeave,
    getMyLeaves,
    getLeaves,
    updateLeave
} = require("../controllers/leaveController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Student applies
router.post(
    "/",
    protect,
    authorize("student"),
    applyLeave
);


// Student views own applications
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyLeaves
);


// Admin views all applications
router.get(
    "/",
    protect,
    authorize("admin"),
    getLeaves
);


// Admin approves/rejects
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateLeave
);


module.exports = router;