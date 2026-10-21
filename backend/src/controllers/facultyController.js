const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Timetable = require("../models/Timetable");
const Faculty = require("../models/Faculty");
const User = require("../models/User");
const Department = require("../models/Department");

// ================= CREATE FACULTY =================

const createFaculty = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            employeeId,
            department,
            designation
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !employeeId ||
            !department ||
            !designation
        ) {
            return res.status(400).json({
                message: "All faculty fields are required"
            });
        }

        const existingDepartment =
            await Department.findById(department);

        if (!existingDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const existingFaculty =
            await Faculty.findOne({ employeeId });

        if (existingFaculty) {
            return res.status(400).json({
                message: "Employee ID already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "faculty"
        });

        try {
            const faculty = await Faculty.create({
                user: user._id,
                employeeId,
                department,
                designation
            });

            const populatedFaculty =
                await Faculty.findById(faculty._id)
                    .populate(
                        "user",
                        "name email role"
                    )
                    .populate(
                        "department",
                        "name code"
                    );

            res.status(201).json({
                message: "Faculty created successfully",
                faculty: populatedFaculty
            });

        } catch (error) {
            await User.findByIdAndDelete(user._id);
            throw error;
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= GET FACULTY =================

const getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find()
            .populate(
                "user",
                "name email role"
            )
            .populate(
                "department",
                "name code"
            )
            .sort({ employeeId: 1 });

        res.status(200).json({
            count: faculty.length,
            faculty
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getMyStudents = async (req, res) => {
    try {
        // Find the faculty profile linked to the logged-in user
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Find subjects taught by this faculty
        const subjects = await Subject.find({
            faculty: faculty._id
        }).select("_id department semester");

        if (subjects.length === 0) {
            return res.status(200).json({
                count: 0,
                students: []
            });
        }

        const subjectIds = subjects.map(subject => subject._id);

        // Find timetable entries for those subjects
        const timetableEntries = await Timetable.find({
            faculty: faculty._id,
            subject: { $in: subjectIds }
        }).select("department semester section");

        let students = [];

        if (timetableEntries.length > 0) {
            // Build department + semester + section combinations
            const classConditions = timetableEntries.map(entry => ({
                department: entry.department,
                semester: entry.semester,
                section: entry.section
            }));

            students = await Student.find({
                $or: classConditions
            })
                .populate("user", "name email role")
                .populate("department", "name code")
                .sort({ rollNumber: 1 });
        } else {
            // Fallback if timetable has not been created yet
            const classConditions = subjects.map(subject => ({
                department: subject.department,
                semester: subject.semester
            }));

            students = await Student.find({
                $or: classConditions
            })
                .populate("user", "name email role")
                .populate("department", "name code")
                .sort({ rollNumber: 1 });
        }

        // Remove duplicates
        const uniqueStudents = Array.from(
            new Map(
                students.map(student => [
                    student._id.toString(),
                    student
                ])
            ).values()
        );

        res.status(200).json({
            count: uniqueStudents.length,
            students: uniqueStudents
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// ================= UPDATE FACULTY =================

const updateFaculty = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            employeeId,
            department,
            designation
        } = req.body;

        const faculty =
            await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        // Department
        if (department) {
            const existingDepartment =
                await Department.findById(department);

            if (!existingDepartment) {
                return res.status(404).json({
                    message: "Department not found"
                });
            }

            faculty.department = department;
        }

        // Employee ID
        if (
            employeeId &&
            employeeId !== faculty.employeeId
        ) {
            const existingFaculty =
                await Faculty.findOne({ employeeId });

            if (existingFaculty) {
                return res.status(400).json({
                    message: "Employee ID already exists"
                });
            }

            faculty.employeeId = employeeId;
        }

        if (designation) {
            faculty.designation = designation;
        }

        // Linked User
        const user =
            await User.findById(faculty.user);

        if (!user) {
            return res.status(404).json({
                message: "Linked user not found"
            });
        }

        if (name) {
            user.name = name;
        }

        if (
            email &&
            email.toLowerCase() !== user.email
        ) {
            const existingUser =
                await User.findOne({
                    email: email.toLowerCase()
                });

            if (
                existingUser &&
                existingUser._id.toString() !==
                    user._id.toString()
            ) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            user.email = email.toLowerCase();
        }

        if (password) {
            user.password =
                await bcrypt.hash(password, 10);
        }

        await user.save();
        await faculty.save();

        const updatedFaculty =
            await Faculty.findById(faculty._id)
                .populate(
                    "user",
                    "name email role"
                )
                .populate(
                    "department",
                    "name code"
                );

        res.status(200).json({
            message: "Faculty updated successfully",
            faculty: updatedFaculty
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= DELETE FACULTY =================

const deleteFaculty = async (req, res) => {
    try {
        const faculty =
            await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        const userId = faculty.user;

        await Faculty.findByIdAndDelete(
            req.params.id
        );

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "Faculty deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createFaculty,
    getFaculty,
    getMyStudents,
    updateFaculty,
    deleteFaculty
};