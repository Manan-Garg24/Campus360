import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [recommendation, setRecommendation] = useState("");
const [recommendationData, setRecommendationData] = useState(null);
const [recommendationLoading, setRecommendationLoading] = useState(true);
const [recommendationError, setRecommendationError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/dashboard/student");
                setDashboard(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    useEffect(() => {
    const fetchRecommendations = async () => {
        try {
            const response = await api.get(
                "/ai/recommendations"
            );

            setRecommendation(
                response.data.recommendation || ""
            );

            setRecommendationData(
                response.data.data || null
            );
        } catch (error) {
            setRecommendationError(
                error.response?.data?.message ||
                "Failed to load AI recommendations"
            );
        } finally {
            setRecommendationLoading(false);
        }
    };

    fetchRecommendations();
}, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-600">
                    Loading dashboard...
                </p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">
                    {error}
                </p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <header className="bg-white shadow-sm px-8 py-5">

                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Campus360
                        </h1>

                        <p className="text-gray-500 text-sm">
                            Student Dashboard
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold text-gray-800">
                            {user.name}
                        </p>

                        <p className="text-sm text-gray-500">
                            Student
                        </p>
                    </div>

                </div>

            </header>


            {/* Main */}
            <main className="max-w-7xl mx-auto p-8">

                {/* Welcome */}
                <div className="mb-8">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Welcome, {dashboard.student.name}! 👋
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Here's an overview of your academic activities.
                    </p>

                </div>


                {/* Profile */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

                    <h3 className="text-xl font-semibold mb-5">
                        Student Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                        <div>
                            <p className="text-sm text-gray-500">
                                Roll Number
                            </p>

                            <p className="font-semibold">
                                {dashboard.student.rollNumber}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Department
                            </p>

                            <p className="font-semibold">
                                {dashboard.student.department.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Semester
                            </p>

                            <p className="font-semibold">
                                {dashboard.student.semester}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Section
                            </p>

                            <p className="font-semibold">
                                {dashboard.student.section}
                            </p>
                        </div>

                    </div>

                </div>


                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <p className="text-gray-500 text-sm">
                            Attendance
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {dashboard.attendance.percentage}%
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            {dashboard.attendance.presentClasses} /{" "}
                            {dashboard.attendance.totalClasses} classes
                        </p>
                    </div>


                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <p className="text-gray-500 text-sm">
                            Assignments
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {dashboard.upcomingAssignments.length}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Upcoming
                        </p>
                    </div>


                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <p className="text-gray-500 text-sm">
                            Pending Leaves
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {dashboard.pendingLeaves}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Awaiting approval
                        </p>
                    </div>


                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <p className="text-gray-500 text-sm">
                            Complaints
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {dashboard.complaints.length}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Recent complaints
                        </p>
                    </div>

                </div>

{/* AI Recommendations */}
<div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-blue-100">

    <div className="flex items-center justify-between mb-5">

        <div>
            <h3 className="text-xl font-semibold text-gray-800">
                ✨ AI Academic Insights
            </h3>

            <p className="text-sm text-gray-500 mt-1">
                Personalized recommendations based on your academic data.
            </p>
        </div>

        <button
            onClick={() => {
                window.location.href = "/student/assistant";
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
            Ask AI
        </button>

    </div>


    {recommendationLoading ? (
        <div className="rounded-xl bg-gray-50 p-5">
            <p className="text-gray-500">
                ✨ Analyzing your academic performance...
            </p>
        </div>
    ) : recommendationError ? (
        <div className="rounded-xl bg-red-50 p-5">
            <p className="text-red-600">
                {recommendationError}
            </p>
        </div>
    ) : (
        <div className="space-y-5">

            {recommendation && (
                <div className="rounded-xl bg-blue-50 p-5">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {recommendation}
                    </p>
                </div>
            )}

            {recommendationData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Attendance */}
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Attendance
                        </p>

                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {recommendationData.attendance?.percentage ?? 0}%
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                            Risk:{" "}
                            {recommendationData.attendance?.risk || "N/A"}
                        </p>
                    </div>


                    {/* Academic Performance */}
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Academic Performance
                        </p>

                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {recommendationData.academics?.overallPercentage ?? 0}%
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                            Risk:{" "}
                            {recommendationData.academics?.risk || "N/A"}
                        </p>
                    </div>


                    {/* Pending Assignments */}
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Pending Assignments
                        </p>

                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {recommendationData.assignments?.pending?.length ?? 0}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                            Need attention
                        </p>
                    </div>

                </div>
            )}

        </div>
    )}

</div>

                {/* Lower sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                    {/* Assignments */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">

                        <h3 className="text-xl font-semibold mb-5">
                            Upcoming Assignments
                        </h3>

                        {dashboard.upcomingAssignments.length === 0 ? (
                            <p className="text-gray-500">
                                No upcoming assignments.
                            </p>
                        ) : (
                            <div className="space-y-4">

                                {dashboard.upcomingAssignments.map(
                                    (assignment) => (
                                        <div
                                            key={assignment._id}
                                            className="border-b pb-3"
                                        >

                                            <p className="font-semibold">
                                                {assignment.title}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {assignment.subject?.name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Due:{" "}
                                                {new Date(
                                                    assignment.dueDate
                                                ).toLocaleDateString()}
                                            </p>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>


                    {/* Grades */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">

                        <h3 className="text-xl font-semibold mb-5">
                            Recent Grades
                        </h3>

                        {dashboard.recentGrades.length === 0 ? (
                            <p className="text-gray-500">
                                No grades available.
                            </p>
                        ) : (
                            <div className="space-y-4">

                                {dashboard.recentGrades.map((grade) => (
                                    <div
                                        key={grade._id}
                                        className="border-b pb-3 flex justify-between"
                                    >

                                        <div>
                                            <p className="font-semibold">
                                                {grade.subject?.name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {grade.examType}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold">
                                                {grade.marks}/{grade.maxMarks}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Grade: {grade.grade}
                                            </p>
                                        </div>

                                    </div>
                                ))}

                            </div>
                        )}

                    </div>


                    {/* Notices */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">

                        <h3 className="text-xl font-semibold mb-5">
                            Recent Notices
                        </h3>

                        {dashboard.recentNotices.length === 0 ? (
                            <p className="text-gray-500">
                                No recent notices.
                            </p>
                        ) : (
                            <div className="space-y-4">

                                {dashboard.recentNotices.map((notice) => (
                                    <div
                                        key={notice._id}
                                        className="border-b pb-3"
                                    >

                                        <p className="font-semibold">
                                            {notice.title}
                                        </p>

                                        <p className="text-sm text-gray-600 mt-1">
                                            {notice.content}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(
                                                notice.publishDate
                                            ).toLocaleDateString()}
                                        </p>

                                    </div>
                                ))}

                            </div>
                        )}

                    </div>


                    {/* Timetable */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">

                        <h3 className="text-xl font-semibold mb-5">
                            Timetable
                        </h3>

                        {dashboard.timetable.length === 0 ? (
                            <p className="text-gray-500">
                                No timetable available.
                            </p>
                        ) : (
                            <div className="space-y-3">

                                {dashboard.timetable.slice(0, 6).map(
                                    (item) => (
                                        <div
                                            key={item._id}
                                            className="flex justify-between border-b pb-3"
                                        >

                                            <div>
                                                <p className="font-semibold">
                                                    {item.subject?.name}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {item.day}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {item.startTime} -{" "}
                                                    {item.endTime}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    Room {item.room}
                                                </p>
                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>

                </div>

            </main>

        </div>
    );
};

export default StudentDashboard;