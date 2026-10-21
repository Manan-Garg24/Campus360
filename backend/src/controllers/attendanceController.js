const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Faculty = require("../models/Faculty");


// Mark attendance
const markAttendance = async (req, res) => {
    try {
        const {
            student,
            subject,
            date,
            status
        } = req.body;

        // Check required fields
        if (!student || !subject || !date || !status) {
            return res.status(400).json({
                message: "Student, subject, date and status are required"
            });
        }

        // Check student exists
        const existingStudent = await Student.findById(student);

        if (!existingStudent) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check subject exists
        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        // Get faculty profile of logged-in faculty
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
            student,
            subject,
            date
        });

        if (existingAttendance) {
            return res.status(400).json({
                message: "Attendance already marked for this student on this date"
            });
        }

        // Create attendance
        const attendance = await Attendance.create({
            student,
            subject,
            faculty: faculty._id,
            date,
            status
        });

        res.status(201).json({
            message: "Attendance marked successfully",
            attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const markBulkAttendance = async (req, res) => {
    try {
        const { subject, date, attendance } = req.body;

        if (!subject || !date || !Array.isArray(attendance)) {
            return res.status(400).json({
                message: "Subject, date and attendance are required"
            });
        }

        // Find logged-in faculty
        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Make sure faculty teaches this subject
        const selectedSubject = await Subject.findOne({
            _id: subject,
            faculty: faculty._id
        });

        if (!selectedSubject) {
            return res.status(403).json({
                message: "You are not authorized to mark attendance for this subject"
            });
        }

        // Normalize date to start of day
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Save/update every student's attendance
        const operations = attendance.map((record) => ({
            updateOne: {
                filter: {
                    student: record.student,
                    subject: subject,
                    faculty: faculty._id,
                    date: attendanceDate
                },
                update: {
                    $set: {
                        status: record.status
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);

        res.status(200).json({
            message: "Attendance saved successfully",
            count: attendance.length
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to save attendance"
        });
    }
};
const getFacultyAttendance = async (req, res) => {
    try {
        const { subject, date } = req.query;

        if (!subject || !date) {
            return res.status(400).json({
                message: "Subject and date are required"
            });
        }

        const faculty = await Faculty.findOne({
            user: req.user._id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Make sure this faculty actually teaches the selected subject
        const selectedSubject = await Subject.findOne({
            _id: subject,
            faculty: faculty._id
        });

        if (!selectedSubject) {
            return res.status(403).json({
                message: "You are not authorized to access this subject"
            });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            subject,
            faculty: faculty._id,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .populate({
                path: "student",
                populate: [
                    {
                        path: "user",
                        select: "name email"
                    },
                    {
                        path: "department",
                        select: "name code"
                    }
                ]
            })
            .sort({ date: 1 });

        res.status(200).json({
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// Get all attendance
const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("subject", "name code")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ date: -1 });

        res.status(200).json({
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get attendance of logged-in student
const getMyAttendance = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const attendance = await Attendance.find({
            student: student._id
        })
            .populate("subject", "name code")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ date: -1 });

        res.status(200).json({
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getMyAttendanceSummary = async (req, res) => {
    try {
        // Find student profile of logged-in user
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Get all attendance records of this student
        const attendance = await Attendance.find({
            student: student._id
        })
            .populate("subject", "name code credits")
            .sort({ date: -1 });

        // Overall statistics
        const totalClasses = attendance.length;

        const presentClasses = attendance.filter(
            record => record.status === "present"
        ).length;

        const absentClasses = attendance.filter(
            record => record.status === "absent"
        ).length;

        const overallPercentage =
            totalClasses > 0
                ? Number(((presentClasses / totalClasses) * 100).toFixed(2))
                : 0;

        // Subject-wise statistics
        const subjectMap = {};

        attendance.forEach((record) => {
            if (!record.subject) {
                return;
            }

            const subjectId = record.subject._id.toString();

            if (!subjectMap[subjectId]) {
                subjectMap[subjectId] = {
                    subjectId,
                    subjectName: record.subject.name,
                    subjectCode: record.subject.code,
                    totalClasses: 0,
                    presentClasses: 0,
                    absentClasses: 0
                };
            }

            subjectMap[subjectId].totalClasses++;

            if (record.status === "present") {
                subjectMap[subjectId].presentClasses++;
            } else {
                subjectMap[subjectId].absentClasses++;
            }
        });

        const subjects = Object.values(subjectMap).map((subject) => ({
            ...subject,
            percentage:
                subject.totalClasses > 0
                    ? Number(
                          (
                              (subject.presentClasses /
                                  subject.totalClasses) *
                              100
                          ).toFixed(2)
                      )
                    : 0
        }));

        res.status(200).json({
            overall: {
                totalClasses,
                presentClasses,
                absentClasses,
                percentage: overallPercentage
            },
            subjects
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    markAttendance,
    markBulkAttendance,
    getAttendance,
    getMyAttendance,
    getMyAttendanceSummary,
    getFacultyAttendance
    
};