import { useEffect, useState } from "react";
import api from "../../services/api";

const FacultyDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/dashboard/faculty");

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


    if (loading) {
        return (
            <p className="text-gray-600">
                Loading dashboard...
            </p>
        );
    }


    if (error) {
        return (
            <p className="text-red-600">
                {error}
            </p>
        );
    }


    return (
        <div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome, {dashboard.faculty.name}! 👋
                </h1>

                <p className="text-gray-500 mt-2">
                    Here's an overview of your teaching activities.
                </p>
            </div>


            {/* Faculty Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

                <h2 className="text-xl font-semibold mb-5">
                    Faculty Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div>
                        <p className="text-sm text-gray-500">
                            Employee ID
                        </p>

                        <p className="font-semibold">
                            {dashboard.faculty.employeeId}
                        </p>
                    </div>


                    <div>
                        <p className="text-sm text-gray-500">
                            Designation
                        </p>

                        <p className="font-semibold">
                            {dashboard.faculty.designation}
                        </p>
                    </div>


                    <div>
                        <p className="text-sm text-gray-500">
                            Department
                        </p>

                        <p className="font-semibold">
                            {dashboard.faculty.department?.name}
                        </p>
                    </div>

                </div>

            </div>


            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <p className="text-gray-500 text-sm">
                        Subjects
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {dashboard.subjects.length}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        Currently teaching
                    </p>

                </div>


                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <p className="text-gray-500 text-sm">
                        Assignments
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {dashboard.upcomingAssignments.length}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        Upcoming
                    </p>

                </div>


                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <p className="text-gray-500 text-sm">
                        Classes
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {dashboard.timetable.length}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        Scheduled
                    </p>

                </div>

            </div>


            {/* Lower sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                {/* Subjects */}
                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        My Subjects
                    </h2>

                    {dashboard.subjects.length === 0 ? (
                        <p className="text-gray-500">
                            No subjects assigned.
                        </p>
                    ) : (
                        <div className="space-y-4">

                            {dashboard.subjects.map((subject) => (

                                <div
                                    key={subject._id}
                                    className="border-b pb-3"
                                >

                                    <p className="font-semibold">
                                        {subject.name}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {subject.code}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Semester {subject.semester}
                                    </p>

                                </div>

                            ))}

                        </div>
                    )}

                </div>


                {/* Assignments */}
                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Upcoming Assignments
                    </h2>

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


                {/* Recent Attendance */}
                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Recent Attendance
                    </h2>

                    {dashboard.recentAttendance.length === 0 ? (
                        <p className="text-gray-500">
                            No attendance records.
                        </p>
                    ) : (
                        <div className="space-y-4">

                            {dashboard.recentAttendance
                                .slice(0, 5)
                                .map((record) => (

                                    <div
                                        key={record._id}
                                        className="flex justify-between border-b pb-3"
                                    >

                                        <div>

                                            <p className="font-semibold">
                                                {record.student?.user?.name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {record.subject?.name}
                                            </p>

                                        </div>


                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium h-fit ${
                                                record.status === "present"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {record.status}
                                        </span>

                                    </div>

                                ))}

                        </div>
                    )}

                </div>


                {/* Recent Grades */}
                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Recent Grades
                    </h2>

                    {dashboard.recentGrades.length === 0 ? (
                        <p className="text-gray-500">
                            No grades recorded.
                        </p>
                    ) : (
                        <div className="space-y-4">

                            {dashboard.recentGrades
                                .slice(0, 5)
                                .map((grade) => (

                                    <div
                                        key={grade._id}
                                        className="flex justify-between border-b pb-3"
                                    >

                                        <div>

                                            <p className="font-semibold">
                                                {grade.student?.user?.name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {grade.subject?.name}
                                            </p>

                                        </div>


                                        <div className="text-right">

                                            <p className="font-bold">
                                                {grade.marks}/
                                                {grade.maxMarks}
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

            </div>

        </div>
    );
};

export default FacultyDashboard;