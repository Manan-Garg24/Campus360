const Assignment = require("../models/Assignment");
const Subject = require("../models/Subject");
const Faculty = require("../models/Faculty");


// Create assignment
const createAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            dueDate,
            totalMarks
        } = req.body;

        // Check required fields
        if (
            !title ||
            !description ||
            !subject ||
            !dueDate ||
            !totalMarks
        ) {
            return res.status(400).json({
                message: "All assignment fields are required"
            });
        }

        // Find faculty profile of logged-in user
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Check subject exists
        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        // Make sure faculty teaches this subject
        if (existingSubject.faculty.toString() !== faculty._id.toString()) {
            return res.status(403).json({
                message: "You are not assigned to this subject"
            });
        }

        // Create assignment
        const assignment = await Assignment.create({
            title,
            description,
            subject,
            faculty: faculty._id,
            dueDate,
            totalMarks
        });

        res.status(201).json({
            message: "Assignment created successfully",
            assignment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all assignments
const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate("subject", "name code semester")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ dueDate: 1 });

        res.status(200).json({
            count: assignments.length,
            assignments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get assignments created by logged-in faculty
const getMyAssignments = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        const assignments = await Assignment.find({
            faculty: faculty._id
        })
            .populate("subject", "name code semester")
            .sort({ dueDate: 1 });

        res.status(200).json({
            count: assignments.length,
            assignments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update assignment
const updateAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            dueDate,
            totalMarks
        } = req.body;

        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        const assignment = await Assignment.findById(
            req.params.id
        );

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Only the creator can update
        if (assignment.faculty.toString() !== faculty._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own assignments"
            });
        }

        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.subject = subject || assignment.subject;
        assignment.dueDate = dueDate || assignment.dueDate;
        assignment.totalMarks = totalMarks || assignment.totalMarks;

        await assignment.save();

        res.status(200).json({
            message: "Assignment updated successfully",
            assignment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete assignment
const deleteAssignment = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        const assignment = await Assignment.findById(
            req.params.id
        );

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Only creator can delete
        if (assignment.faculty.toString() !== faculty._id.toString()) {
            return res.status(403).json({
                message: "You can only delete your own assignments"
            });
        }

        await assignment.deleteOne();

        res.status(200).json({
            message: "Assignment deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createAssignment,
    getAssignments,
    getMyAssignments,
    updateAssignment,
    deleteAssignment
};