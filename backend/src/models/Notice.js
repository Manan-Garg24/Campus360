const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        targetAudience: {
            type: String,
            enum: ["all", "student", "faculty", "department"],
            default: "all"
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
        },

        publishDate: {
            type: Date,
            default: Date.now
        },

        expiryDate: {
            type: Date,
            default: null
        },

        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notice", noticeSchema);