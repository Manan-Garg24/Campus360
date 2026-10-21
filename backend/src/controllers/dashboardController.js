const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Grade = require("../models/Grade");
const Timetable = require("../models/Timetable");
const Notice = require("../models/Notice");
const Complaint = require("../models/Complaint");
const Leave = require("../models/Leave");


// ==========================================
// STUDENT DASHBOARD
// ==========================================

const getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        })
            .populate("user", "name email")
            .populate("department", "name code");

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Attendance
        const attendanceRecords = await Attendance.find({
            student: student._id
        });

        const totalClasses = attendanceRecords.length;

        const presentClasses = attendanceRecords.filter(
            record => record.status === "present"
        ).length;

        const absentClasses = attendanceRecords.filter(
            record => record.status === "absent"
        ).length;

        const attendancePercentage =
            totalClasses > 0
                ? Math.round(
                    (presentClasses / totalClasses) * 100
                )
                : 0;


        // Upcoming assignments
        const upcomingAssignments = await Assignment.find({
            dueDate: {
                $gte: new Date()
            }
        })
            .populate("subject", "name code")
            .sort({ dueDate: 1 })
            .limit(5);


        // Recent grades
        const recentGrades = await Grade.find({
            student: student._id
        })
            .populate("subject", "name code")
            .sort({ createdAt: -1 })
            .limit(5);


        // Student timetable
        const timetable = await Timetable.find({
            department: student.department._id,
            semester: student.semester,
            section: student.section
        })
            .populate("subject", "name code")
            .populate({
                path: "faculty",
                populate: {
                    path: "user",
                    select: "name"
                }
            })
            .sort({
                day: 1,
                startTime: 1
            });


        // Recent notices
        // Recent notices
const notices = await Notice.find({
    publishDate: {
        $lte: new Date()
    },

    $and: [
        {
            $or: [
                { expiryDate: null },
                { expiryDate: { $gte: new Date() } }
            ]
        },
        {
            $or: [
                { targetAudience: "all" },
                { targetAudience: "student" },
                {
                    targetAudience: "department",
                    department: student.department._id
                }
            ]
        }
    ]
})
    .populate("createdBy", "name")
    .populate("department", "name code")
    .sort({ publishDate: -1 })
    .limit(5);


        // Pending leaves
        const pendingLeaves = await Leave.countDocuments({
            student: student._id,
            status: "pending"
        });


        // Complaints
        const complaints = await Complaint.find({
            student: student._id
        })
            .sort({ createdAt: -1 })
            .limit(5);


        res.status(200).json({
            student: {
                id: student._id,
                name: student.user.name,
                email: student.user.email,
                rollNumber: student.rollNumber,
                department: student.department,
                semester: student.semester,
                section: student.section,
                enrollmentYear: student.enrollmentYear
            },

            attendance: {
                totalClasses,
                presentClasses,
                absentClasses,
                percentage: attendancePercentage
            },

            upcomingAssignments,

            recentGrades,

            timetable,

            recentNotices: notices,

            pendingLeaves,

            complaints
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// FACULTY DASHBOARD
// ==========================================

const getFacultyDashboard = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({
            user: req.user._id
        })
            .populate("user", "name email")
            .populate("department", "name code");

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }


        // Subjects taught by faculty
        const subjects = await Subject.find({
            faculty: faculty._id
        })
            .populate("department", "name code");


        // Faculty assignments
        const upcomingAssignments = await Assignment.find({
            faculty: faculty._id,
            dueDate: {
                $gte: new Date()
            }
        })
            .populate("subject", "name code")
            .sort({ dueDate: 1 })
            .limit(5);


        // Recent attendance marked by faculty
        const recentAttendance = await Attendance.find({
            faculty: faculty._id
        })
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("subject", "name code")
            .sort({ date: -1 })
            .limit(10);


        // Recent grades
        const recentGrades = await Grade.find({
            faculty: faculty._id
        })
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("subject", "name code")
            .sort({ createdAt: -1 })
            .limit(10);


        // Faculty timetable
        const timetable = await Timetable.find({
            faculty: faculty._id
        })
            .populate("subject", "name code")
            .populate("department", "name code")
            .sort({
                day: 1,
                startTime: 1
            });


        res.status(200).json({
            faculty: {
                id: faculty._id,
                name: faculty.user.name,
                email: faculty.user.email,
                employeeId: faculty.employeeId,
                designation: faculty.designation,
                department: faculty.department
            },

            subjects,

            upcomingAssignments,

            recentAttendance,

            recentGrades,

            timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// ADMIN DASHBOARD
// ==========================================

const getAdminDashboard = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();

        const totalFaculty = await Faculty.countDocuments();

        const totalDepartments =
            await Department.countDocuments();

        const totalSubjects =
            await Subject.countDocuments();

        const totalAssignments =
            await Assignment.countDocuments();

        const totalAttendance =
            await Attendance.countDocuments();


        const pendingComplaints =
            await Complaint.countDocuments({
                status: {
                    $in: ["pending", "in_progress"]
                }
            });


        const pendingLeaves =
            await Leave.countDocuments({
                status: "pending"
            });


        const recentNotices = await Notice.find()
            .populate("createdBy", "name email")
            .populate("department", "name code")
            .sort({ createdAt: -1 })
            .limit(5);


        const recentComplaints = await Complaint.find()
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 })
            .limit(5);


        const recentLeaves = await Leave.find()
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 })
            .limit(5);


        res.status(200).json({
            statistics: {
                totalStudents,
                totalFaculty,
                totalDepartments,
                totalSubjects,
                totalAssignments,
                totalAttendance
            },

            pending: {
                complaints: pendingComplaints,
                leaves: pendingLeaves
            },

            recentNotices,

            recentComplaints,

            recentLeaves
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getStudentDashboard,
    getFacultyDashboard,
    getAdminDashboard
};