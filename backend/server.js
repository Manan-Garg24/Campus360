const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorMiddleware");
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./src/routes/authRoutes");
const departmentRoutes = require("./src/routes/departmentRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const facultyRoutes = require("./src/routes/facultyRoutes");
const subjectRoutes = require("./src/routes/subjectRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const assignmentRoutes = require("./src/routes/assignmentRoutes");
const submissionRoutes = require("./src/routes/submissionRoutes");
const gradeRoutes = require("./src/routes/gradeRoutes");
const timetableRoutes = require("./src/routes/timetableRoutes");
const noticeRoutes = require("./src/routes/noticeRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const leaveRoutes = require("./src/routes/leaveRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const aiRecommendationRoutes = require("./src/routes/aiRecommendationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use(
    "/api/ai/recommendations",
    aiRecommendationRoutes
);
// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Campus360 API is running 🚀"
    });
});

const PORT = process.env.PORT || 5000;
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});