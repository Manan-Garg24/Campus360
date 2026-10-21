import { useEffect, useState } from "react";
import api from "../../services/api";

const FacultyAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [attendance, setAttendance] = useState({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Fetch subjects and students
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectResponse, studentResponse] = await Promise.all([
                    api.get("/subjects/my"),
                    api.get("/faculty/my-students"),
                ]);

                const subjectData = Array.isArray(subjectResponse.data)
                    ? subjectResponse.data
                    : subjectResponse.data.subjects || [];

                const studentData = Array.isArray(studentResponse.data)
                    ? studentResponse.data
                    : studentResponse.data.students || [];

                setSubjects(subjectData);
                setStudents(studentData);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load attendance data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // When subject changes, set every student as present by default
    // Load existing attendance when subject or date changes
useEffect(() => {
    const loadExistingAttendance = async () => {
        if (!selectedSubject || !selectedDate || students.length === 0) {
            return;
        }

        try {
            setError("");
            setMessage("");

            // First, set everyone as present by default
            const initialAttendance = {};

            students.forEach((student) => {
                initialAttendance[student._id] = "present";
            });

            // Get attendance already saved for this subject/date
            const response = await api.get("/attendance/faculty", {
                params: {
                    subject: selectedSubject,
                    date: selectedDate
                }
            });

            const existingAttendance = response.data.attendance || [];

            // Replace default values with saved values
            existingAttendance.forEach((record) => {
                initialAttendance[record.student._id || record.student] =
                    record.status;
            });

            setAttendance(initialAttendance);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load existing attendance."
            );
        }
    };

    loadExistingAttendance();
}, [selectedSubject, selectedDate, students]);

    const handleStatusChange = (studentId, status) => {
        setAttendance((previous) => ({
            ...previous,
            [studentId]: status,
        }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedSubject) {
        setError("Please select a subject.");
        return;
    }

    if (!selectedDate) {
        setError("Please select a date.");
        return;
    }

    if (students.length === 0) {
        setError("No students available.");
        return;
    }

    setSubmitting(true);

    try {
        const attendanceData = students.map((student) => ({
            student: student._id,
            status: attendance[student._id] || "absent"
        }));

        await api.post("/attendance/bulk", {
            subject: selectedSubject,
            date: selectedDate,
            attendance: attendanceData
        });

        setMessage("Attendance saved successfully.");

    } catch (err) {
        console.error(err);

        setError(
            err.response?.data?.message ||
            "Failed to save attendance."
        );
    } finally {
        setSubmitting(false);
    }
};

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading attendance data...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Mark Attendance
                </h1>

                <p className="text-gray-500 mt-1">
                    Select a subject and mark attendance for students.
                </p>
            </div>

            {/* Success */}
            {message && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                    {message}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                        </label>

                        <select
                            value={selectedSubject}
                            onChange={(e) =>
                                setSelectedSubject(e.target.value)
                            }
                            className="w-full border rounded-lg px-4 py-3"
                        >
                            <option value="">
                                Select Subject
                            </option>

                            {subjects.map((subject) => (
                                <option
                                    key={subject._id}
                                    value={subject._id}
                                >
                                    {subject.name} ({subject.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) =>
                                setSelectedDate(e.target.value)
                            }
                            className="w-full border rounded-lg px-4 py-3"
                        />
                    </div>

                </div>
            </div>

            {/* Students */}
            {selectedSubject && (
                <form onSubmit={handleSubmit}>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                Student Attendance
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
                                                Student
                                            </th>

                                            <th className="text-left p-4">
                                                Semester
                                            </th>

                                            <th className="text-left p-4">
                                                Section
                                            </th>

                                            <th className="text-center p-4">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {students.map((student) => (
                                            <tr
                                                key={student._id}
                                                className="border-t"
                                            >
                                                <td className="p-4 font-medium">
                                                    {student.rollNumber}
                                                </td>

                                                <td className="p-4">
                                                    {student.user?.name || "N/A"}
                                                </td>

                                                <td className="p-4">
                                                    {student.semester}
                                                </td>

                                                <td className="p-4">
                                                    {student.section}
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex justify-center gap-4">

                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`attendance-${student._id}`}
                                                                checked={
                                                                    attendance[student._id] ===
                                                                    "present"
                                                                }
                                                                onChange={() =>
                                                                    handleStatusChange(
                                                                        student._id,
                                                                        "present"
                                                                    )
                                                                }
                                                            />

                                                            <span className="text-green-600 font-medium">
                                                                Present
                                                            </span>
                                                        </label>

                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`attendance-${student._id}`}
                                                                checked={
                                                                    attendance[student._id] ===
                                                                    "absent"
                                                                }
                                                                onChange={() =>
                                                                    handleStatusChange(
                                                                        student._id,
                                                                        "absent"
                                                                    )
                                                                }
                                                            />

                                                            <span className="text-red-600 font-medium">
                                                                Absent
                                                            </span>
                                                        </label>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        )}

                        {students.length > 0 && (
                            <div className="p-6 border-t flex justify-end">

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : "Save Attendance"}
                                </button>

                            </div>
                        )}

                    </div>

                </form>
            )}

        </div>
    );
};

export default FacultyAttendance;