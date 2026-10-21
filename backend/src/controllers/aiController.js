const { generateAIResponse } = require("../services/aiService");

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Subject = require("../models/Subject");
const Grade = require("../models/Grade");
const Timetable = require("../models/Timetable");
const Notice = require("../models/Notice");
const Leave = require("../models/Leave");
const Complaint = require("../models/Complaint");

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const question = message.trim().toLowerCase();

        // Find logged-in student's profile
        const student = await Student.findOne({
            user: req.user._id
        }).populate("department");

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        let studentContext = {
            student: {
                name: req.user.name,
                email: req.user.email,
                rollNumber: student.rollNumber,
                department: student.department?.name || "N/A",
                semester: student.semester,
                section: student.section
            }
        };

        /*
         * ATTENDANCE QUESTIONS
         */
        if (
            question.includes("attendance") ||
            question.includes("present") ||
            question.includes("absent")
        ) {
            const attendanceRecords = await Attendance.find({
                student: student._id
            })
                .populate("subject", "name code")
                .lean();
//                 console.log("AI Student ID:", student._id);
// console.log("AI Attendance Records:", attendanceRecords);
// console.log("AI Attendance Count:", attendanceRecords.length);

            const totalClasses = attendanceRecords.length;

            const presentClasses = attendanceRecords.filter(
                (record) => record.status === "present"
            ).length;

            const absentClasses = attendanceRecords.filter(
                (record) => record.status === "absent"
            ).length;

            const percentage =
                totalClasses > 0
                    ? Number(
                          (
                              (presentClasses / totalClasses) *
                              100
                          ).toFixed(1)
                      )
                    : 0;

            // Subject-wise attendance
            const subjectAttendance = {};

            attendanceRecords.forEach((record) => {
                const subjectId =
                    record.subject?._id?.toString();

                if (!subjectId) return;

                if (!subjectAttendance[subjectId]) {
                    subjectAttendance[subjectId] = {
                        subject:
                            record.subject.name,
                        code:
                            record.subject.code,
                        total: 0,
                        present: 0,
                        absent: 0
                    };
                }

                subjectAttendance[subjectId].total++;

                if (record.status === "present") {
                    subjectAttendance[subjectId].present++;
                } else {
                    subjectAttendance[subjectId].absent++;
                }
            });

            Object.values(subjectAttendance).forEach(
                (subject) => {
                    subject.percentage =
                        subject.total > 0
                            ? Number(
                                  (
                                      (subject.present /
                                          subject.total) *
                                      100
                                  ).toFixed(1)
                              )
                            : 0;
                }
            );

            studentContext.attendance = {
                totalClasses,
                presentClasses,
                absentClasses,
                percentage,
                subjectWise:
                    Object.values(subjectAttendance)
            };
        }

        /*
         * ASSIGNMENT QUESTIONS
         */
        else if (
            question.includes("assignment") ||
            question.includes("homework") ||
            question.includes("submission")
        ) {
            const subjects = await Subject.find({
                department:
                    student.department?._id ||
                    student.department,
                semester: student.semester
            }).select("_id name code");

            const subjectIds = subjects.map(
                (subject) => subject._id
            );

            const assignments = await Assignment.find({
                subject: { $in: subjectIds }
            })
                .populate("subject", "name code")
                .sort({ dueDate: 1 })
                .lean();

            const submissions = await Submission.find({
                student: student._id
            }).select("assignment status marks");

            const submittedIds = new Set(
                submissions.map((submission) =>
                    submission.assignment.toString()
                )
            );

            const pendingAssignments = assignments
                .filter(
                    (assignment) =>
                        !submittedIds.has(
                            assignment._id.toString()
                        )
                )
                .map((assignment) => ({
                    title: assignment.title,
                    subject:
                        assignment.subject?.name ||
                        "Unknown",
                    subjectCode:
                        assignment.subject?.code ||
                        "",
                    dueDate: assignment.dueDate,
                    totalMarks: assignment.totalMarks
                }));

            studentContext.assignments = {
                total: assignments.length,
                pending: pendingAssignments
            };
        }
        /*
 * GRADE QUESTIONS
 */
else if (
    question.includes("grade") ||
    question.includes("marks") ||
    question.includes("percentage") ||
    question.includes("score") ||
    question.includes("performance") ||
    question.includes("result")
) {
    const grades = await Grade.find({
        student: student._id
    })
        .populate("subject", "name code")
        .sort({ createdAt: -1 })
        .lean();

    const totalMarks = grades.reduce(
        (sum, item) => sum + item.marks,
        0
    );

    const totalMaxMarks = grades.reduce(
        (sum, item) => sum + item.maxMarks,
        0
    );

    const overallPercentage =
        totalMaxMarks > 0
            ? Number(
                  (
                      (totalMarks / totalMaxMarks) *
                      100
                  ).toFixed(1)
              )
            : 0;

    const subjectPerformance = {};

    grades.forEach((item) => {
        const subjectId =
            item.subject?._id?.toString();

        if (!subjectId) return;

        if (!subjectPerformance[subjectId]) {
            subjectPerformance[subjectId] = {
                subject:
                    item.subject.name,
                code:
                    item.subject.code,
                marks: 0,
                maxMarks: 0,
                assessments: []
            };
        }

        subjectPerformance[subjectId].marks +=
            item.marks;

        subjectPerformance[subjectId].maxMarks +=
            item.maxMarks;

        subjectPerformance[subjectId].assessments.push({
            examType: item.examType,
            marks: item.marks,
            maxMarks: item.maxMarks,
            grade: item.grade
        });
    });

    Object.values(subjectPerformance).forEach(
        (subject) => {
            subject.percentage =
                subject.maxMarks > 0
                    ? Number(
                          (
                              (subject.marks /
                                  subject.maxMarks) *
                              100
                          ).toFixed(1)
                      )
                    : 0;
        }
    );

    studentContext.grades = {
        totalAssessments: grades.length,
        totalMarks,
        totalMaxMarks,
        overallPercentage,
        subjects:
            Object.values(subjectPerformance)
    };
}

/*
 * TIMETABLE QUESTIONS
 */
else if (
    question.includes("timetable") ||
    question.includes("schedule") ||
    question.includes("class") ||
    question.includes("lecture") ||
    question.includes("next class")
) {
    const timetable = await Timetable.find({
        department:
            student.department?._id ||
            student.department,
        semester: student.semester,
        section: student.section
    })
        .populate("subject", "name code")
        .populate("faculty", "employeeId")
        .sort({
            day: 1,
            startTime: 1
        })
        .lean();

    studentContext.timetable = {
        totalClasses: timetable.length,

        classes: timetable.map((item) => ({
            subject:
                item.subject?.name || "Unknown",
            subjectCode:
                item.subject?.code || "",
            faculty:
                item.faculty?.employeeId || "Unknown",
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            room: item.room
        }))
    };
}

// NOTICES
else if (
    question.includes("notice") ||
    question.includes("notices") ||
    question.includes("announcement") ||
    question.includes("announcements") ||
    question.includes("circular") ||
    question.includes("campus update") ||
    question.includes("important update")
) {
    const now = new Date();

    const notices = await Notice.find({
        publishDate: { $lte: now },

        $or: [
            { expiryDate: null },
            { expiryDate: { $gte: now } }
        ],

        $and: [
            {
                $or: [
                    { targetAudience: "all" },
                    { targetAudience: "student" },
                    {
                        targetAudience: "department",
                        department: student.department?._id
                    }
                ]
            }
        ]
    })
        .sort({ publishDate: -1 })
        .lean();

    studentContext.notices = {
        total: notices.length,

        notices: notices.map((notice) => ({
            title: notice.title,
            content: notice.content,
            priority: notice.priority,
            publishDate: notice.publishDate,
            expiryDate: notice.expiryDate
        }))
    };
}

// LEAVE
else if (
    question.includes("leave") ||
    question.includes("leaves") ||
    question.includes("holiday request") ||
    question.includes("leave request")
) {
    const leaves = await Leave.find({
        student: student._id
    })
        .sort({ createdAt: -1 })
        .lean();

    const pendingLeaves = leaves.filter(
        (leave) => leave.status === "pending"
    );

    const approvedLeaves = leaves.filter(
        (leave) => leave.status === "approved"
    );

    const rejectedLeaves = leaves.filter(
        (leave) => leave.status === "rejected"
    );

    studentContext.leaves = {
        totalRequests: leaves.length,
        pending: pendingLeaves.length,
        approved: approvedLeaves.length,
        rejected: rejectedLeaves.length,

        requests: leaves.map((leave) => ({
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            leaveType: leave.leaveType,
            status: leave.status,
            adminRemarks: leave.adminRemarks || ""
        }))
    };
}

// COMPLAINTS
else if (
     question.includes("complaint") ||
    question.includes("complaints") ||
    question.includes("grievance") ||
    question.includes("complaint status")
) {
    const complaints = await Complaint.find({
        student: student._id
    })
        .sort({ createdAt: -1 })
        .lean();

    const pendingComplaints = complaints.filter(
        (complaint) =>
            complaint.status === "pending"
    );

    const inProgressComplaints = complaints.filter(
        (complaint) =>
            complaint.status === "in_progress"
    );

    const resolvedComplaints = complaints.filter(
        (complaint) =>
            complaint.status === "resolved"
    );

    const rejectedComplaints = complaints.filter(
        (complaint) =>
            complaint.status === "rejected"
    );

    studentContext.complaints = {
        total: complaints.length,

        pending: pendingComplaints.length,
        inProgress: inProgressComplaints.length,
        resolved: resolvedComplaints.length,
        rejected: rejectedComplaints.length,

        requests: complaints.map((complaint) => ({
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            status: complaint.status,
            adminResponse:
                complaint.adminResponse || "",
            resolvedAt: complaint.resolvedAt
        }))
    };
}
        /*
         * GENERAL QUESTIONS
         *
         * No unnecessary database queries.
         */
        const reply = await generateAIResponse(
            message,
            studentContext
        );

        return res.status(200).json({
            reply
        });

    } catch (error) {
        console.error("AI Error:", error);

        return res.status(500).json({
            message: "Failed to generate AI response"
        });
    }
};

module.exports = {
    chatWithAI
};