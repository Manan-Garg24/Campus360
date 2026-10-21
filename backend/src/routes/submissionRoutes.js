const express = require("express");

const {
    submitAssignment,
    getMySubmissions,
    getMySubmissionForAssignment,
    getAssignmentSubmissions,
    gradeSubmission
} = require("../controllers/submissionController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Student submits assignment
router.post(
    "/",
    protect,
    authorize("student"),
    submitAssignment
);


// Student gets all own submissions
router.get(
    "/my",
    protect,
    authorize("student"),
    getMySubmissions
);


// Student gets submission for a specific assignment
router.get(
    "/my/:assignmentId",
    protect,
    authorize("student"),
    getMySubmissionForAssignment
);
// Faculty gets submissions for an assignment
router.get(
    "/assignment/:assignmentId",
    protect,
    authorize("faculty"),
    getAssignmentSubmissions
);


// Faculty grades a submission
router.put(
    "/:submissionId/grade",
    protect,
    authorize("faculty"),
    gradeSubmission
);

module.exports = router;