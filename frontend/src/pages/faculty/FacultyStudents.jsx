import { useEffect, useState } from "react";
import api from "../../services/api";

const FacultyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get("/faculty/my-students")

                const data = response.data;

                setStudents(
                    Array.isArray(data)
                        ? data
                        : data.students || []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load students"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading students...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Students
                </h1>
                <p className="text-gray-500 mt-1">
                    View students available in the system.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Student count */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500 text-sm">
                    Total Students
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                    {students.length}
                </p>
            </div>

            {/* Students table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Student List
                    </h2>
                </div>

                {students.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No students found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4">
                                        Roll Number
                                    </th>

                                    <th className="text-left p-4">
                                        Name
                                    </th>

                                    <th className="text-left p-4">
                                        Department
                                    </th>

                                    <th className="text-left p-4">
                                        Semester
                                    </th>

                                    <th className="text-left p-4">
                                        Section
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {students.map((student) => (
                                    <tr
                                        key={student._id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-4 font-medium">
                                            {student.rollNumber}
                                        </td>

                                        <td className="p-4">
                                            {student.user?.name || "N/A"}
                                        </td>

                                        <td className="p-4">
                                            {student.department?.name || "N/A"}
                                        </td>

                                        <td className="p-4">
                                            {student.semester}
                                        </td>

                                        <td className="p-4">
                                            {student.section}
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

export default FacultyStudents;