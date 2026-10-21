const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "hostel",
                "library",
                "canteen",
                "transport",
                "academic",
                "infrastructure",
                "other"
            ],
            default: "other"
        },

        status: {
            type: String,
            enum: [
                "pending",
                "in_progress",
                "resolved",
                "rejected"
            ],
            default: "pending"
        },

        adminResponse: {
            type: String,
            default: ""
        },

        resolvedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Complaint", complaintSchema);