import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const response = await api.get("/dashboard/admin");

            

            setDashboard(
                response.data.dashboard || response.data
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    fetchDashboard();
}, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                {error}
            </div>
        );
    }

    if (!dashboard) {
        return null;
    }

    const stats = [
    {
        title: "Students",
        value: dashboard.statistics?.totalStudents ?? 0,
    },
    {
        title: "Faculty",
        value: dashboard.statistics?.totalFaculty ?? 0,
    },
    {
        title: "Departments",
        value: dashboard.statistics?.totalDepartments ?? 0,
    },
    {
        title: "Subjects",
        value: dashboard.statistics?.totalSubjects ?? 0,
    },
    {
        title: "Assignments",
        value: dashboard.statistics?.totalAssignments ?? 0,
    },
    {
        title: "Attendance Records",
        value: dashboard.statistics?.totalAttendance ?? 0,
    },
];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Admin Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                    Overview of your campus management system.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="bg-white rounded-xl shadow-sm p-6"
                    >
                        <p className="text-gray-500 text-sm">
                            {stat.title}
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {stat.value}
                        </p>
                    </div>
                ))}

            </div>

            {/* Pending items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">
                        Pending Complaints
                    </p>

                    <p className="text-3xl font-bold text-orange-600 mt-2">
                        {dashboard.pending?.complaints ?? 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">
                        Pending Leave Applications
                    </p>

                    <p className="text-3xl font-bold text-orange-600 mt-2">
                        {dashboard.pending?.leaves ?? 0}
                    </p>
                </div>

            </div>

            {/* Recent Notices */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Recent Notices
                    </h2>
                </div>

                {!dashboard.recentNotices ||
                dashboard.recentNotices.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No recent notices.
                    </div>
                ) : (
                    <div className="divide-y">

                        {dashboard.recentNotices.map((notice) => (
                            <div
                                key={notice._id}
                                className="p-5"
                            >
                                <h3 className="font-semibold text-gray-800">
                                    {notice.title}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {notice.content}
                                </p>
                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Recent Complaints
                    </h2>
                </div>

                {!dashboard.recentComplaints ||
                dashboard.recentComplaints.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No recent complaints.
                    </div>
                ) : (
                    <div className="divide-y">

                        {dashboard.recentComplaints.map((complaint) => (
                            <div
                                key={complaint._id}
                                className="p-5 flex justify-between gap-4"
                            >
                                <div>
                                    <h3 className="font-semibold">
                                        {complaint.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {complaint.student?.user?.name ||
                                            "Unknown Student"}
                                    </p>
                                </div>

                                <span className="text-sm capitalize">
                                    {complaint.status}
                                </span>
                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default AdminDashboard;