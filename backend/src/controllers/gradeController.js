const Grade = require("../models/Grade");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Faculty = require("../models/Faculty");


// Add grade
const createGrade = async (req, res) => {
    try {
        const {
            student,
            subject,
            marks,
            maxMarks,
            grade,
            examType
        } = req.body;

        // Check required fields
        if (
            !student ||
            !subject ||
            marks === undefined ||
            !maxMarks ||
            !grade ||
            !examType
        ) {
            return res.status(400).json({
                message: "All grade fields are required"
            });
        }

        // Check student
        const existingStudent = await Student.findById(student);

        if (!existingStudent) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check subject
        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        // Find logged-in faculty profile
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Make sure faculty teaches this subject
        if (
            existingSubject.faculty.toString() !==
            faculty._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not assigned to this subject"
            });
        }

        // Validate marks
        if (marks > maxMarks) {
            return res.status(400).json({
                message: "Marks cannot be greater than max marks"
            });
        }

        // Check duplicate grade
        const existingGrade = await Grade.findOne({
            student,
            subject,
            examType
        });

        if (existingGrade) {
            return res.status(400).json({
                message: "Grade already exists for this exam"
            });
        }

        const newGrade = await Grade.create({
            student,
            subject,
            faculty: faculty._id,
            marks,
            maxMarks,
            grade,
            examType
        });

        res.status(201).json({
            message: "Grade added successfully",
            grade: newGrade
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all grades
const getGrades = async (req, res) => {
    try {
        const grades = await Grade.find()
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("subject", "name code semester")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: grades.length,
            grades
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get logged-in student's grades
const getMyGrades = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const grades = await Grade.find({
            student: student._id
        })
            .populate("subject", "name code semester credits")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: grades.length,
            grades
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update grade
const updateGrade = async (req, res) => {
    try {
        const {
            marks,
            maxMarks,
            grade,
            examType
        } = req.body;

        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        const existingGrade = await Grade.findById(
            req.params.id
        );

        if (!existingGrade) {
            return res.status(404).json({
                message: "Grade not found"
            });
        }

        // Only creator can update
        if (
            existingGrade.faculty.toString() !==
            faculty._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only update grades you created"
            });
        }

        const finalMarks =
            marks !== undefined ? marks : existingGrade.marks;

        const finalMaxMarks =
            maxMarks !== undefined
                ? maxMarks
                : existingGrade.maxMarks;

        if (finalMarks > finalMaxMarks) {
            return res.status(400).json({
                message: "Marks cannot be greater than max marks"
            });
        }

        existingGrade.marks = finalMarks;
        existingGrade.maxMarks = finalMaxMarks;
        existingGrade.grade = grade || existingGrade.grade;
        existingGrade.examType =
            examType || existingGrade.examType;

        await existingGrade.save();

        res.status(200).json({
            message: "Grade updated successfully",
            grade: existingGrade
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete grade
const deleteGrade = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        const existingGrade = await Grade.findById(
            req.params.id
        );

        if (!existingGrade) {
            return res.status(404).json({
                message: "Grade not found"
            });
        }

        // Only creator can delete
        if (
            existingGrade.faculty.toString() !==
            faculty._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only delete grades you created"
            });
        }

        await existingGrade.deleteOne();

        res.status(200).json({
            message: "Grade deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createGrade,
    getGrades,
    getMyGrades,
    updateGrade,
    deleteGrade
};