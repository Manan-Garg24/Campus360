const Timetable = require("../models/Timetable");
const Subject = require("../models/Subject");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");


// Create timetable entry
const createTimetable = async (req, res) => {
    try {
        const {
            subject,
            faculty,
            department,
            semester,
            section,
            day,
            startTime,
            endTime,
            room
        } = req.body;

        // Check required fields
        if (
            !subject ||
            !faculty ||
            !department ||
            !semester ||
            !section ||
            !day ||
            !startTime ||
            !endTime ||
            !room
        ) {
            return res.status(400).json({
                message: "All timetable fields are required"
            });
        }

        // Check subject
        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        // Check faculty
        const existingFaculty = await Faculty.findById(faculty);

        if (!existingFaculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        // Check department
        const existingDepartment = await Department.findById(department);

        if (!existingDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        // Check that subject belongs to faculty
        if (
            existingSubject.faculty.toString() !==
            faculty.toString()
        ) {
            return res.status(400).json({
                message: "Subject is not assigned to this faculty"
            });
        }

        // Check for timetable conflict
        const conflict = await Timetable.findOne({
            department,
            semester,
            section,
            day,
            startTime
        });

        if (conflict) {
            return res.status(400).json({
                message: "Timetable slot already exists"
            });
        }

        const timetable = await Timetable.create({
            subject,
            faculty,
            department,
            semester,
            section,
            day,
            startTime,
            endTime,
            room
        });

        res.status(201).json({
            message: "Timetable created successfully",
            timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all timetable entries
const getTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find()
            .populate("subject", "name code credits")
            .populate("department", "name code")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({
                day: 1,
                startTime: 1
            });

        res.status(200).json({
            count: timetable.length,
            timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get timetable for logged-in student
const getMyTimetable = async (req, res) => {
    try {
        const Student = require("../models/Student");

        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const timetable = await Timetable.find({
            department: student.department,
            semester: student.semester,
            section: student.section
        })
            .populate("subject", "name code credits")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({
                day: 1,
                startTime: 1
            });

        res.status(200).json({
            count: timetable.length,
            timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get timetable for logged-in faculty
const getFacultyTimetable = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        const timetable = await Timetable.find({
            faculty: faculty._id
        })
            .populate("subject", "name code credits")
            .populate("department", "name code")
            .sort({
                day: 1,
                startTime: 1
            });

        res.status(200).json({
            count: timetable.length,
            timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update timetable
const updateTimetable = async (req, res) => {
    try {
        const {
            subject,
            faculty,
            department,
            semester,
            section,
            day,
            startTime,
            endTime,
            room
        } = req.body;

        const timetable = await Timetable.findById(
            req.params.id
        );

        if (!timetable) {
            return res.status(404).json({
                message: "Timetable entry not found"
            });
        }

        timetable.subject = subject || timetable.subject;
        timetable.faculty = faculty || timetable.faculty;
        timetable.department = department || timetable.department;
        timetable.semester = semester || timetable.semester;
        timetable.section = section || timetable.section;
        timetable.day = day || timetable.day;
        timetable.startTime = startTime || timetable.startTime;
        timetable.endTime = endTime || timetable.endTime;
        timetable.room = room || timetable.room;

        await timetable.save();

        res.status(200).json({
            message: "Timetable updated successfully",
            timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete timetable
const deleteTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndDelete(
            req.params.id
        );

        if (!timetable) {
            return res.status(404).json({
                message: "Timetable entry not found"
            });
        }

        res.status(200).json({
            message: "Timetable deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createTimetable,
    getTimetable,
    getMyTimetable,
    getFacultyTimetable,
    updateTimetable,
    deleteTimetable
};