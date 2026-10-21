const Leave = require("../models/Leave");
const Student = require("../models/Student");

// Student applies for leave
const applyLeave = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            reason,
            leaveType
        } = req.body;

        if (!startDate || !endDate || !reason) {
            return res.status(400).json({
                message:
                    "Start date, end date and reason are required"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        if (end < start) {
            return res.status(400).json({
                message:
                    "End date cannot be before start date"
            });
        }

        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Prevent overlapping pending/approved leaves
        const overlappingLeave = await Leave.findOne({
            student: student._id,
            status: {
                $in: ["pending", "approved"]
            },
            startDate: {
                $lte: end
            },
            endDate: {
                $gte: start
            }
        });

        if (overlappingLeave) {
            return res.status(400).json({
                message:
                    "You already have a pending or approved leave for these dates"
            });
        }

        const leave = await Leave.create({
            student: student._id,
            startDate: start,
            endDate: end,
            reason,
            leaveType: leaveType || "personal"
        });

        const populatedLeave =
            await Leave.findById(leave._id)
                .populate({
                    path: "student",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                });

        res.status(201).json({
            message: "Leave application submitted successfully",
            leave: populatedLeave
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Student gets own leaves
const getMyLeaves = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const leaves = await Leave.find({
            student: student._id
        })
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: leaves.length,
            leaves
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Admin gets all leave applications
const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
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
            .sort({
                status: 1,
                startDate: 1
            });

        res.status(200).json({
            count: leaves.length,
            leaves
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Admin approves/rejects leave
const updateLeave = async (req, res) => {
    try {
        const {
            status,
            adminRemarks
        } = req.body;

        const leave = await Leave.findById(
            req.params.id
        );

        if (!leave) {
            return res.status(404).json({
                message: "Leave application not found"
            });
        }

        if (
            status &&
            !["pending", "approved", "rejected"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid leave status"
            });
        }

        if (status) {
            leave.status = status;
        }

        if (adminRemarks !== undefined) {
            leave.adminRemarks = adminRemarks;
        }

        await leave.save();

        const updatedLeave =
            await Leave.findById(leave._id)
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
                });

        res.status(200).json({
            message:
                "Leave application updated successfully",
            leave: updatedLeave
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    applyLeave,
    getMyLeaves,
    getLeaves,
    updateLeave
};