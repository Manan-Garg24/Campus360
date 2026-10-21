import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentGrades = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await api.get("/grades/my");

                const data = response.data;

                setGrades(
                    Array.isArray(data)
                        ? data
                        : data.grades || []
                );
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load grades"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    if (loading) {
        return (
            <p className="text-gray-600">
                Loading grades...
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

    const totalMarks = grades.reduce(
        (sum, grade) => sum + Number(grade.marks || 0),
        0
    );

    const totalMaxMarks = grades.reduce(
        (sum, grade) => sum + Number(grade.maxMarks || 0),
        0
    );

    const percentage =
        totalMaxMarks > 0
            ? Number(
                  ((totalMarks / totalMaxMarks) * 100).toFixed(2)
              )
            : 0;

    const gradeCount = grades.length;

    const getPerformanceColor = () => {
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 75) return "text-blue-600";
        if (percentage >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Grades
                </h1>

                <p className="text-gray-500 mt-2">
                    View your academic performance.
                </p>
            </div>


            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                {/* Percentage */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">
                        Overall Percentage
                    </p>

                    <p
                        className={`text-3xl font-bold mt-2 ${getPerformanceColor()}`}
                    >
                        {percentage}%
                    </p>
                </div>


                {/* Obtained */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">
                        Marks Obtained
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {totalMarks}
                    </p>
                </div>


                {/* Maximum */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">
                        Total Marks
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {totalMaxMarks}
                    </p>
                </div>


                {/* Exams */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">
                        Assessments
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {gradeCount}
                    </p>
                </div>

            </div>


            {/* Performance Warning */}
            {percentage < 40 && grades.length > 0 && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
                    ⚠️ Your current academic performance is below
                    40%. Consider focusing more on your upcoming
                    assessments.
                </div>
            )}


            {/* Grades Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Grade Records
                    </h2>
                </div>


                {grades.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No grades available.
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
                                        Exam
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Marks
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Percentage
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Grade
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {grades.map((grade) => {

                                    const gradePercentage =
                                        grade.maxMarks > 0
                                            ? (
                                                  (grade.marks /
                                                      grade.maxMarks) *
                                                  100
                                              ).toFixed(1)
                                            : 0;

                                    return (
                                        <tr
                                            key={grade._id}
                                            className="border-t hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4">
                                                <div className="font-medium">
                                                    {grade.subject?.name ||
                                                        "Unknown Subject"}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {grade.subject?.code || ""}
                                                </div>
                                            </td>


                                            <td className="px-6 py-4 capitalize">
                                                {grade.examType}
                                            </td>


                                            <td className="px-6 py-4">
                                                {grade.marks} /{" "}
                                                {grade.maxMarks}
                                            </td>


                                            <td className="px-6 py-4">
                                                {gradePercentage}%
                                            </td>


                                            <td className="px-6 py-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        gradePercentage >= 90
                                                            ? "bg-green-100 text-green-700"
                                                            : gradePercentage >= 75
                                                            ? "bg-blue-100 text-blue-700"
                                                            : gradePercentage >= 40
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {grade.grade}
                                                </span>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
};

export default StudentGrades;