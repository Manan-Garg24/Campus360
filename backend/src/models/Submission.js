const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        answer: {
            type: String,
            required: true,
            trim: true
        },

        submittedAt: {
            type: Date,
            default: Date.now
        },

        marks: {
            type: Number,
            default: null
        },

        feedback: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["submitted", "graded"],
            default: "submitted"
        }
    },
    {
        timestamps: true
    }
);

submissionSchema.index(
    {
        assignment: 1,
        student: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Submission", submissionSchema);