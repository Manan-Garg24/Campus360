import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);

    const [summary, setSummary] = useState({
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        percentage: 0
    });

    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    const fetchAttendance = async () => {
        try {
            const response = await api.get(
                "/attendance/my/summary"
            );

            setSummary(
                response.data.overall || {
                    totalClasses: 0,
                    presentClasses: 0,
                    absentClasses: 0,
                    percentage: 0
                }
            );

            setSubjects(response.data.subjects || []);

            // Keep loading the individual records
            // for the attendance table
            const attendanceResponse = await api.get(
                "/attendance/my"
            );

            setAttendance(
                attendanceResponse.data.attendance ||
                attendanceResponse.data
            );

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load attendance"
            );
        } finally {
            setLoading(false);
        }
    };

    fetchAttendance();
}, []);

    if (loading) {
        return <p className="text-gray-600">Loading attendance...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    

    return (
        <div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Attendance
                </h1>

                <p className="text-gray-500 mt-2">
                    Track your attendance records.
                </p>
            </div>


            {/* Statistics */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
    <p className="text-gray-500">
        Total Classes
    </p>

    <p className="text-3xl font-bold mt-2">
        {summary.totalClasses}
    </p>
</div>

                


                <div className="bg-white rounded-2xl shadow-sm p-6">
    <p className="text-gray-500">
        Present
    </p>

    <p className="text-3xl font-bold mt-2 text-green-600">
        {summary.presentClasses}
    </p>
</div>


                <div className="bg-white rounded-2xl shadow-sm p-6">
    <p className="text-gray-500">
        Absent
    </p>

    <p className="text-3xl font-bold mt-2 text-red-600">
        {summary.absentClasses}
    </p>
</div>

<div className="bg-white rounded-2xl shadow-sm p-6">
    <p className="text-gray-500">
        Attendance Percentage
    </p>

    <p
        className={`text-3xl font-bold mt-2 ${
            summary.percentage < 75
                ? "text-red-600"
                : "text-green-600"
        }`}
    >
        {summary.percentage}%
    </p>
</div>

            </div>
{summary.percentage < 75 && (
    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
        ⚠️ Your overall attendance is below 75%.
        Please attend more classes to maintain the required attendance.
    </div>
)}

{/* Subject-wise Attendance */}
<div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">

    <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">
            Subject-wise Attendance
        </h2>
    </div>

    {subjects.length === 0 ? (
        <div className="p-6 text-gray-500">
            No subject attendance records found.
        </div>
    ) : (
        <div className="overflow-x-auto">

            <table className="w-full">

                <thead className="bg-gray-50">

                    <tr>

                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                            Subject
                        </th>

                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                            Total
                        </th>

                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                            Present
                        </th>

                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                            Absent
                        </th>

                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                            Attendance
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {subjects.map((subject) => (

                        <tr
                            key={subject.subjectId}
                            className="border-t"
                        >

                            <td className="px-6 py-4">

                                <div className="font-medium">
                                    {subject.subjectName}
                                </div>

                                <div className="text-sm text-gray-500">
                                    {subject.subjectCode}
                                </div>

                            </td>

                            <td className="text-center px-6 py-4">
                                {subject.totalClasses}
                            </td>

                            <td className="text-center px-6 py-4 text-green-600">
                                {subject.presentClasses}
                            </td>

                            <td className="text-center px-6 py-4 text-red-600">
                                {subject.absentClasses}
                            </td>

                            <td
                                className={`text-center px-6 py-4 font-semibold ${
                                    subject.percentage < 75
                                        ? "text-red-600"
                                        : "text-green-600"
                                }`}
                            >
                                {subject.percentage}%
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    )}

</div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Attendance Records
                    </h2>
                </div>


                {attendance.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Subject
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Date
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>
                                </tr>

                            </thead>


                            <tbody>

                                {attendance.map((record) => (
                                    <tr
                                        key={record._id}
                                        className="border-t"
                                    >

                                        <td className="px-6 py-4">
                                            {record.subject?.name ||
                                                "Unknown Subject"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(
                                                record.date
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    record.status ===
                                                    "present"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {record.status}
                                            </span>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
};

export default StudentAttendance;