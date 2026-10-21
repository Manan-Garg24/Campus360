const express = require("express");

const {
    createNotice,
    getNotices,
    getMyNotices,
    updateNotice,
    deleteNotice
} = require("../controllers/noticeController");

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
    createNotice
);


// All authenticated users
router.get(
    "/",
    protect,
    authorize("admin", "student", "faculty"),
    getNotices
);


// Relevant notices for logged-in user
router.get(
    "/my",
    protect,
    authorize("admin", "student", "faculty"),
    getMyNotices
);


// Admin
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateNotice
);


// Admin
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteNotice
);


module.exports = router;