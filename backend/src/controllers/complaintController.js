const Complaint = require("../models/Complaint");
const Student = require("../models/Student");

// Student creates complaint
const createComplaint = async (req, res) => {
    try {
        const {
            title,
            description,
            category
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
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

        const complaint = await Complaint.create({
            student: student._id,
            title,
            description,
            category: category || "other"
        });

        const populatedComplaint =
            await Complaint.findById(complaint._id)
                .populate({
                    path: "student",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                });

        res.status(201).json({
            message: "Complaint submitted successfully",
            complaint: populatedComplaint
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Student gets own complaints
const getMyComplaints = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const complaints = await Complaint.find({
            student: student._id
        })
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Admin gets all complaints
const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
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
                createdAt: -1
            });

        res.status(200).json({
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Admin updates complaint
const updateComplaint = async (req, res) => {
    try {
        const {
            status,
            adminResponse
        } = req.body;

        const complaint = await Complaint.findById(
            req.params.id
        );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        if (status) {
            complaint.status = status;

            if (status === "resolved") {
                complaint.resolvedAt = new Date();
            } else {
                complaint.resolvedAt = null;
            }
        }

        if (adminResponse !== undefined) {
            complaint.adminResponse = adminResponse;
        }

        await complaint.save();

        const updatedComplaint =
            await Complaint.findById(complaint._id)
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
            message: "Complaint updated successfully",
            complaint: updatedComplaint
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Admin deletes complaint
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(
            req.params.id
        );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        await Complaint.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message: "Complaint deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaints,
    updateComplaint,
    deleteComplaint
};