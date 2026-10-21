const { generateAIResponse } = require("../services/aiService");

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Subject = require("../models/Subject");
const Grade = require("../models/Grade");

const getRecommendations = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        }).populate("department");

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // -----------------------------
        // ATTENDANCE ANALYSIS
        // -----------------------------

        const attendanceRecords = await Attendance.find({
            student: student._id
        })
            .populate("subject", "name code")
            .lean();

        const totalClasses = attendanceRecords.length;

        const presentClasses = attendanceRecords.filter(
            (record) => record.status === "present"
        ).length;

        const attendancePercentage =
            totalClasses > 0
                ? Number(
                      (
                          (presentClasses / totalClasses) *
                          100
                      ).toFixed(1)
                  )
                : 0;

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

        // -----------------------------
        // GRADE ANALYSIS
        // -----------------------------

        const grades = await Grade.find({
            student: student._id
        })
            .populate("subject", "name code")
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

        const subjectGrades = {};

        grades.forEach((item) => {
            const subjectId =
                item.subject?._id?.toString();

            if (!subjectId) return;

            if (!subjectGrades[subjectId]) {
                subjectGrades[subjectId] = {
                    subject:
                        item.subject.name,
                    code:
                        item.subject.code,
                    marks: 0,
                    maxMarks: 0
                };
            }

            subjectGrades[subjectId].marks +=
                item.marks;

            subjectGrades[subjectId].maxMarks +=
                item.maxMarks;
        });

        Object.values(subjectGrades).forEach(
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

        // -----------------------------
        // ASSIGNMENT ANALYSIS
        // -----------------------------

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
        }).select("assignment status");

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
                dueDate: assignment.dueDate,
                totalMarks: assignment.totalMarks
            }));

        // -----------------------------
        // RISK CALCULATION
        // -----------------------------

        let attendanceRisk = "low";

        if (attendancePercentage < 60) {
            attendanceRisk = "high";
        } else if (attendancePercentage < 75) {
            attendanceRisk = "medium";
        }

        let academicRisk = "low";

        if (
            grades.length > 0 &&
            overallPercentage < 50
        ) {
            academicRisk = "high";
        } else if (
            grades.length > 0 &&
            overallPercentage < 65
        ) {
            academicRisk = "medium";
        }

        // -----------------------------
        // AI CONTEXT
        // -----------------------------

        const recommendationContext = {
            student: {
                name: req.user.name,
                department:
                    student.department?.name || "N/A",
                semester: student.semester,
                section: student.section
            },

            attendance: {
                percentage: attendancePercentage,
                totalClasses,
                presentClasses,
                subjects:
                    Object.values(subjectAttendance),
                risk: attendanceRisk
            },

            academics: {
                overallPercentage,
                totalAssessments: grades.length,
                subjects:
                    Object.values(subjectGrades),
                risk: academicRisk
            },

            assignments: {
                total: assignments.length,
                pending: pendingAssignments
            }
        };

        const prompt = `
You are the Campus360 AI Academic Advisor.

Analyze the student's academic information below and provide
personalized, practical recommendations.

STUDENT DATA:
${JSON.stringify(
    recommendationContext,
    null,
    2
)}

Rules:
- Base recommendations ONLY on the provided data.
- Never invent marks, attendance, assignments, or subjects.
- Clearly mention when data is unavailable.
- Identify weak attendance or academic areas.
- Prioritize the most important problems first.
- Give practical actions the student can take.
- Keep the response concise and easy to understand.
- Do not make medical, legal, or other high-stakes claims.

Return your response with these sections:

1. Overall Assessment
2. Areas Needing Attention
3. Recommended Actions
4. Positive Points

`;

        const recommendation =
            await generateAIResponse(
                prompt,
                recommendationContext
            );

        return res.status(200).json({
            recommendation,
            data: recommendationContext
        });

    } catch (error) {
        console.error(
            "AI Recommendation Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to generate recommendations"
        });
    }
};

module.exports = {
    getRecommendations
};