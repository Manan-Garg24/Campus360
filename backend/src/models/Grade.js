const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },

        marks: {
            type: Number,
            required: true,
            min: 0
        },

        maxMarks: {
            type: Number,
            required: true,
            min: 1
        },

        grade: {
            type: String,
            required: true,
            trim: true
        },

        examType: {
            type: String,
            enum: ["internal", "midterm", "endterm", "assignment"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Grade", gradeSchema);