const bcrypt = require("bcryptjs");

const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");

// ================= CREATE STUDENT =================

const createStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            rollNumber,
            department,
            semester,
            section,
            enrollmentYear
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !rollNumber ||
            !department ||
            !semester ||
            !section ||
            !enrollmentYear
        ) {
            return res.status(400).json({
                message: "All student fields are required"
            });
        }

        // Check department
        const existingDepartment =
            await Department.findById(department);

        if (!existingDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        // Check email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Check roll number
        const existingStudent =
            await Student.findOne({ rollNumber });

        if (existingStudent) {
            return res.status(400).json({
                message: "Roll number already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "student"
        });

        try {
            // Create Student profile
            const student = await Student.create({
                user: user._id,
                rollNumber,
                department,
                semester,
                section,
                enrollmentYear
            });

            const populatedStudent =
                await Student.findById(student._id)
                    .populate("user", "name email role")
                    .populate(
                        "department",
                        "name code"
                    );

            res.status(201).json({
                message: "Student created successfully",
                student: populatedStudent
            });

        } catch (error) {
            // If Student creation fails,
            // remove the User we just created.
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


// ================= GET STUDENTS =================

const getStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate(
                "user",
                "name email role"
            )
            .populate(
                "department",
                "name code"
            )
            .sort({ rollNumber: 1 });

        res.status(200).json({
            count: students.length,
            students
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= UPDATE STUDENT =================

const updateStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            rollNumber,
            department,
            semester,
            section,
            enrollmentYear
        } = req.body;

        const student =
            await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check department if supplied
        if (department) {
            const existingDepartment =
                await Department.findById(department);

            if (!existingDepartment) {
                return res.status(404).json({
                    message: "Department not found"
                });
            }

            student.department = department;
        }

        // Check roll number
        if (
            rollNumber &&
            rollNumber !== student.rollNumber
        ) {
            const existingStudent =
                await Student.findOne({ rollNumber });

            if (existingStudent) {
                return res.status(400).json({
                    message: "Roll number already exists"
                });
            }

            student.rollNumber = rollNumber;
        }

        // Update student fields
        if (semester !== undefined) {
            student.semester = semester;
        }

        if (section) {
            student.section = section;
        }

        if (enrollmentYear !== undefined) {
            student.enrollmentYear = enrollmentYear;
        }

        // Update linked User
        const user = await User.findById(student.user);

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

            user.email = email;
        }

        if (password) {
            user.password = await bcrypt.hash(
                password,
                10
            );
        }

        await user.save();
        await student.save();

        const updatedStudent =
            await Student.findById(student._id)
                .populate(
                    "user",
                    "name email role"
                )
                .populate(
                    "department",
                    "name code"
                );

        res.status(200).json({
            message: "Student updated successfully",
            student: updatedStudent
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= DELETE STUDENT =================

const deleteStudent = async (req, res) => {
    try {
        const student =
            await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const userId = student.user;

        await Student.findByIdAndDelete(
            req.params.id
        );

        // Delete linked login account too
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent
};