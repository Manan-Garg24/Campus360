const Notice = require("../models/Notice");
const Department = require("../models/Department");

// Create Notice
const createNotice = async (req, res) => {
    try {
        const {
            title,
            content,
            targetAudience,
            department,
            publishDate,
            expiryDate,
            priority
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const audience = targetAudience || "all";

        // Department is required only for department-specific notices
        if (audience === "department") {
            if (!department) {
                return res.status(400).json({
                    message:
                        "Department is required for department-specific notice"
                });
            }

            const existingDepartment =
                await Department.findById(department);

            if (!existingDepartment) {
                return res.status(404).json({
                    message: "Department not found"
                });
            }
        }

        // For non-department notices, department should be null
        const notice = await Notice.create({
            title,
            content,
            createdBy: req.user._id,
            targetAudience: audience,
            department:
                audience === "department" ? department : null,
            publishDate: publishDate || new Date(),
            expiryDate: expiryDate || null,
            priority: priority || "normal"
        });

        const populatedNotice = await Notice.findById(notice._id)
            .populate("createdBy", "name email role")
            .populate("department", "name code");

        res.status(201).json({
            message: "Notice created successfully",
            notice: populatedNotice
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all notices - Admin
const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate("createdBy", "name email role")
            .populate("department", "name code")
            .sort({
                publishDate: -1,
                createdAt: -1
            });

        res.status(200).json({
            count: notices.length,
            notices
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get notices relevant to logged-in user
const getMyNotices = async (req, res) => {
    try {
        const now = new Date();

        let departmentId = null;

        // Student
        if (req.user.role === "student") {
            const Student = require("../models/Student");

            const student = await Student.findOne({
                user: req.user._id
            });

            if (student) {
                departmentId = student.department;
            }
        }

        // Faculty
        if (req.user.role === "faculty") {
            const Faculty = require("../models/Faculty");

            const faculty = await Faculty.findOne({
                user: req.user._id
            });

            if (faculty) {
                departmentId = faculty.department;
            }
        }

        const audienceConditions = [
            { targetAudience: "all" },
            {
                targetAudience: req.user.role
            }
        ];

        if (departmentId) {
            audienceConditions.push({
                targetAudience: "department",
                department: departmentId
            });
        }

        const notices = await Notice.find({
            publishDate: {
                $lte: now
            },

            $and: [
                {
                    $or: [
                        { expiryDate: null },
                        { expiryDate: { $gte: now } }
                    ]
                },
                {
                    $or: audienceConditions
                }
            ]
        })
            .populate("createdBy", "name")
            .populate("department", "name code")
            .sort({
                priority: -1,
                publishDate: -1
            });

        res.status(200).json({
            count: notices.length,
            notices
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update Notice
const updateNotice = async (req, res) => {
    try {
        const {
            title,
            content,
            targetAudience,
            department,
            publishDate,
            expiryDate,
            priority
        } = req.body;

        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        const audience =
            targetAudience || notice.targetAudience;

        // Department validation
        if (audience === "department") {
            const departmentId =
                department || notice.department;

            if (!departmentId) {
                return res.status(400).json({
                    message:
                        "Department is required for department-specific notice"
                });
            }

            const existingDepartment =
                await Department.findById(departmentId);

            if (!existingDepartment) {
                return res.status(404).json({
                    message: "Department not found"
                });
            }

            notice.department = departmentId;
        } else {
            notice.department = null;
        }

        if (title) notice.title = title;
        if (content) notice.content = content;

        notice.targetAudience = audience;

        if (publishDate !== undefined) {
            notice.publishDate = publishDate;
        }

        if (expiryDate !== undefined) {
            notice.expiryDate = expiryDate || null;
        }

        if (priority) {
            notice.priority = priority;
        }

        await notice.save();

        const updatedNotice = await Notice.findById(notice._id)
            .populate("createdBy", "name email role")
            .populate("department", "name code");

        res.status(200).json({
            message: "Notice updated successfully",
            notice: updatedNotice
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete Notice
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        await Notice.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Notice deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createNotice,
    getNotices,
    getMyNotices,
    updateNotice,
    deleteNotice
};