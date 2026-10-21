const Subject = require("../models/Subject");
const Department = require("../models/Department");
const Faculty = require("../models/Faculty");

const Assignment = require("../models/Assignment");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");
const Timetable = require("../models/Timetable");

// Create Subject
const createSubject = async (req, res) => {
    try {
        const {
            name,
            code,
            department,
            semester,
            credits,
            faculty
        } = req.body;

        if (
            !name ||
            !code ||
            !department ||
            semester === undefined ||
            credits === undefined ||
            !faculty
        ) {
            return res.status(400).json({
                message: "All subject fields are required"
            });
        }

        // Check department
        const existingDepartment = await Department.findById(department);

        if (!existingDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        // Check faculty
        const existingFaculty = await Faculty.findById(faculty);

        if (!existingFaculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        // Faculty must belong to selected department
        if (
            existingFaculty.department.toString() !==
            department.toString()
        ) {
            return res.status(400).json({
                message: "Faculty does not belong to selected department"
            });
        }

        // Check duplicate subject code
        const existingSubject = await Subject.findOne({
            code: code.toUpperCase()
        });

        if (existingSubject) {
            return res.status(400).json({
                message: "Subject code already exists"
            });
        }

        const subject = await Subject.create({
            name,
            code: code.toUpperCase(),
            department,
            semester,
            credits,
            faculty
        });

        const populatedSubject = await Subject.findById(subject._id)
            .populate("department", "name code")
            .populate({
                path: "faculty",
                select: "employeeId designation",
                populate: {
                    path: "user",
                    select: "name email"
                }
            });

        res.status(201).json({
            message: "Subject created successfully",
            subject: populatedSubject
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all Subjects
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate("department", "name code")
            .populate({
                path: "faculty",
                select: "employeeId designation",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ semester: 1, code: 1 });

        res.status(200).json({
            count: subjects.length,
            subjects
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const getMySubjects = async (req, res) => {
    try {
        // Find the Faculty profile linked to the logged-in User
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Get only subjects taught by this faculty
        const subjects = await Subject.find({
            faculty: faculty._id
        })
            .populate("department", "name code")
            .populate({
                path: "faculty",
                select: "employeeId designation",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ semester: 1, code: 1 });

        res.status(200).json({
            count: subjects.length,
            subjects
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// Update Subject
const updateSubject = async (req, res) => {
    try {
        const {
            name,
            code,
            department,
            semester,
            credits,
            faculty
        } = req.body;

        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        const newDepartment = department || subject.department;
        const newFaculty = faculty || subject.faculty;

        // Validate department
        const existingDepartment = await Department.findById(
            newDepartment
        );

        if (!existingDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        // Validate faculty
        const existingFaculty = await Faculty.findById(
            newFaculty
        );

        if (!existingFaculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        // Faculty must belong to department
        if (
            existingFaculty.department.toString() !==
            newDepartment.toString()
        ) {
            return res.status(400).json({
                message: "Faculty does not belong to selected department"
            });
        }

        // Check duplicate code
        if (code) {
            const normalizedCode = code.toUpperCase();

            const existingSubject = await Subject.findOne({
                code: normalizedCode
            });

            if (
                existingSubject &&
                existingSubject._id.toString() !== subject._id.toString()
            ) {
                return res.status(400).json({
                    message: "Subject code already exists"
                });
            }

            subject.code = normalizedCode;
        }

        if (name) subject.name = name;
        if (department) subject.department = department;
        if (semester !== undefined) subject.semester = semester;
        if (credits !== undefined) subject.credits = credits;
        if (faculty) subject.faculty = faculty;

        await subject.save();

        const updatedSubject = await Subject.findById(subject._id)
            .populate("department", "name code")
            .populate({
                path: "faculty",
                select: "employeeId designation",
                populate: {
                    path: "user",
                    select: "name email"
                }
            });

        res.status(200).json({
            message: "Subject updated successfully",
            subject: updatedSubject
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        // Prevent deletion if subject is already being used
        const [assignment, attendance, grade, timetable] =
            await Promise.all([
                Assignment.exists({ subject: subject._id }),
                Attendance.exists({ subject: subject._id }),
                Grade.exists({ subject: subject._id }),
                Timetable.exists({ subject: subject._id })
            ]);

        if (assignment || attendance || grade || timetable) {
            return res.status(400).json({
                message:
                    "Cannot delete this subject because it is already being used by assignments, attendance, grades, or timetable"
            });
        }

        await Subject.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Subject deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createSubject,
    getSubjects,
    getMySubjects,
    updateSubject,
    deleteSubject
};