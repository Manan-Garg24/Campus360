const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");
const {
    protect,
    authorize
} = require("../middleware/authMiddleware");
const router = express.Router();

const {
    registerValidator,
    loginValidator
} = require("../validators/authValidator");

const validate = require("../middleware/validationMiddleware");

// Register
router.post("/register", registerValidator,
    validate, registerUser);
router.post("/login", loginValidator,
    validate, loginUser);
// Protected route
router.get("/me", protect, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});

router.get(
    "/admin-test",
    protect,
    authorize("admin"),
    (req, res) => {
        res.json({
            message: "Welcome Admin! You have access."
        });
    }
);
module.exports = router;