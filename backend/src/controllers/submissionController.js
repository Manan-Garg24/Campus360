const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");


// ==========================================
// STUDENT: Submit Assignment
// ==========================================

const submitAssignment = async (req, res) => {
    try {
        const { assignment, answer } = req.body;

        if (!assignment || !answer || !answer.trim()) {
            return res.status(400).json({
                message: "Assignment and answer are required"
            });
        }

        // Find logged-in student's profile
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Check assignment exists
        const assignmentData = await Assignment.findById(assignment);

        if (!assignmentData) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Check deadline
        const currentDate = new Date();

        if (currentDate > new Date(assignmentData.dueDate)) {
            return res.status(400).json({
                message: "Assignment deadline has passed"
            });
        }

        // Check existing submission
        const existingSubmission = await Submission.findOne({
            assignment,
            student: student._id
        });

        if (existingSubmission) {
            return res.status(400).json({
                message: "You have already submitted this assignment"
            });
        }

        // Create submission
        const submission = await Submission.create({
            assignment,
            student: student._id,
            answer: answer.trim()
        });

        const populatedSubmission = await Submission.findById(
            submission._id
        )
            .populate({
                path: "assignment",
                populate: {
                    path: "subject",
                    select: "name code"
                }
            })
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            });

        res.status(201).json({
            message: "Assignment submitted successfully",
            submission: populatedSubmission
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to submit assignment"
        });
    }
};


// ==========================================
// STUDENT: Get My Submissions
// ==========================================

const getMySubmissions = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const submissions = await Submission.find({
            student: student._id
        })
            .populate({
                path: "assignment",
                populate: {
                    path: "subject",
                    select: "name code"
                }
            })
            .sort({
                submittedAt: -1
            });

        res.status(200).json({
            count: submissions.length,
            submissions
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load submissions"
        });
    }
};


// ==========================================
// STUDENT: Get Submission For Assignment
// ==========================================

const getMySubmissionForAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const submission = await Submission.findOne({
            assignment: assignmentId,
            student: student._id
        })
            .populate({
                path: "assignment",
                populate: {
                    path: "subject",
                    select: "name code"
                }
            });

        if (!submission) {
            return res.status(404).json({
                message: "No submission found"
            });
        }

        res.status(200).json({
            submission
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load submission"
        });
    }
};

// ==========================================
// FACULTY: Get submissions for an assignment
// ==========================================

const getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Check that this assignment belongs to logged-in faculty
        if (assignment.faculty.toString() !== req.user._id.toString()) {
            const Faculty = require("../models/Faculty");

            const faculty = await Faculty.findOne({
                user: req.user._id
            });

            if (
                !faculty ||
                assignment.faculty.toString() !== faculty._id.toString()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to view these submissions"
                });
            }
        }

        const submissions = await Submission.find({
            assignment: assignmentId
        })
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({
                submittedAt: -1
            });

        res.status(200).json({
            count: submissions.length,
            submissions
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load submissions"
        });
    }
};


// ==========================================
// FACULTY: Grade a submission
// ==========================================

const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { marks, feedback } = req.body;

        if (marks === undefined || marks === null) {
            return res.status(400).json({
                message: "Marks are required"
            });
        }

        const submission = await Submission.findById(
            submissionId
        ).populate("assignment");

        if (!submission) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        const Faculty = require("../models/Faculty");

        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        if (
            submission.assignment.faculty.toString() !==
            faculty._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to grade this submission"
            });
        }

        const numericMarks = Number(marks);

        if (numericMarks < 0) {
            return res.status(400).json({
                message: "Marks cannot be negative"
            });
        }

        if (numericMarks > submission.assignment.totalMarks) {
            return res.status(400).json({
                message: `Marks cannot be greater than ${submission.assignment.totalMarks}`
            });
        }

        submission.marks = numericMarks;
        submission.feedback = feedback?.trim() || "";
        submission.status = "graded";

        await submission.save();

        res.status(200).json({
            message: "Submission graded successfully",
            submission
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to grade submission"
        });
    }
};

module.exports = {
    submitAssignment,
    getMySubmissions,
    getMySubmissionForAssignment,
    getAssignmentSubmissions,
    gradeSubmission
};