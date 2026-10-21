import { useEffect, useState } from "react";
import api from "../../services/api";

const FacultyGrades = () => {
    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        student: "",
        subject: "",
        marks: "",
        maxMarks: "",
        grade: "",
        examType: "internal",
    });

    const fetchData = async () => {
        try {
            const [gradeResponse, studentResponse, subjectResponse] =
                await Promise.all([
                    api.get("/grades"),
                    api.get("/faculty/my-students"),
                    api.get("/subjects/my"),
                ]);

            const gradeData = Array.isArray(gradeResponse.data)
                ? gradeResponse.data
                : gradeResponse.data.grades || [];

            const studentData = Array.isArray(studentResponse.data)
                ? studentResponse.data
                : studentResponse.data.students || [];

            const subjectData = Array.isArray(subjectResponse.data)
                ? subjectResponse.data
                : subjectResponse.data.subjects || [];

            setGrades(gradeData);
            setStudents(studentData);
            setSubjects(subjectData);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load grade data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const calculateGrade = (marks, maxMarks) => {
        const marksValue = Number(marks);
        const maxValue = Number(maxMarks);

        if (!maxValue || marks === "") {
            return "";
        }

        const percentage = (marksValue / maxValue) * 100;

        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        if (percentage >= 40) return "E";

        return "F";
    };

    const handleMarksChange = (e) => {
        const marks = e.target.value;

        setForm((previous) => ({
            ...previous,
            marks,
            grade: calculateGrade(
                marks,
                previous.maxMarks
            ),
        }));
    };

    const handleMaxMarksChange = (e) => {
        const maxMarks = e.target.value;

        setForm((previous) => ({
            ...previous,
            maxMarks,
            grade: calculateGrade(
                previous.marks,
                maxMarks
            ),
        }));
    };

    const resetForm = () => {
        setForm({
            student: "",
            subject: "",
            marks: "",
            maxMarks: "",
            grade: "",
            examType: "internal",
        });

        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const marks = Number(form.marks);
        const maxMarks = Number(form.maxMarks);

        if (marks < 0) {
            setError("Marks cannot be negative.");
            return;
        }

        if (maxMarks <= 0) {
            setError("Maximum marks must be greater than zero.");
            return;
        }

        if (marks > maxMarks) {
            setError("Marks cannot be greater than maximum marks.");
            return;
        }

        setSaving(true);

        try {
            const gradeData = {
                student: form.student,
                subject: form.subject,
                marks,
                maxMarks,
                grade: calculateGrade(marks, maxMarks),
                examType: form.examType,
            };

            if (editingId) {
                await api.put(
                    `/grades/${editingId}`,
                    gradeData
                );

                setMessage("Grade updated successfully.");
            } else {
                await api.post(
                    "/grades",
                    gradeData
                );

                setMessage("Grade added successfully.");
            }

            resetForm();
            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save grade."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (grade) => {
        setEditingId(grade._id);

        setForm({
            student: grade.student?._id || "",
            subject: grade.subject?._id || "",
            marks: grade.marks ?? "",
            maxMarks: grade.maxMarks ?? "",
            grade: grade.grade || "",
            examType: grade.examType || "internal",
        });

        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this grade?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.delete(`/grades/${id}`);

            setMessage("Grade deleted successfully.");

            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete grade."
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading grades...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Grades
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Add and manage student grades.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                    + Add Grade
                </button>

            </div>

            {/* Messages */}
            {message && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm p-6">

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-xl font-semibold">
                            {editingId
                                ? "Edit Grade"
                                : "Add Grade"}
                        </h2>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Student */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student
                            </label>

                            <select
                                name="student"
                                value={form.student}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-3"
                            >
                                <option value="">
                                    Select Student
                                </option>

                                {students.map((student) => (
                                    <option
                                        key={student._id}
                                        value={student._id}
                                    >
                                        {student.rollNumber} -{" "}
                                        {student.user?.name || "Unknown"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>

                            <select
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                required
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

                        {/* Exam Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Exam Type
                            </label>

                            <select
                                name="examType"
                                value={form.examType}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-3"
                            >
                                <option value="internal">
                                    Internal
                                </option>

                                <option value="midterm">
                                    Midterm
                                </option>

                                <option value="endterm">
                                    Endterm
                                </option>

                                <option value="assignment">
                                    Assignment
                                </option>
                            </select>
                        </div>

                        {/* Marks */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marks Obtained
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="marks"
                                    value={form.marks}
                                    onChange={handleMarksChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Marks
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="maxMarks"
                                    value={form.maxMarks}
                                    onChange={handleMaxMarksChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade
                                </label>

                                <input
                                    type="text"
                                    value={form.grade}
                                    readOnly
                                    className="w-full border rounded-lg px-4 py-3 bg-gray-100 font-semibold"
                                />
                            </div>

                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-5 py-3 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Grade"
                                    : "Add Grade"}
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Grades Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Grade Records
                    </h2>
                </div>

                {grades.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No grades available.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4">
                                        Student
                                    </th>

                                    <th className="text-left p-4">
                                        Subject
                                    </th>

                                    <th className="text-left p-4">
                                        Exam
                                    </th>

                                    <th className="text-left p-4">
                                        Marks
                                    </th>

                                    <th className="text-left p-4">
                                        Percentage
                                    </th>

                                    <th className="text-left p-4">
                                        Grade
                                    </th>

                                    <th className="text-center p-4">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {grades.map((grade) => {

                                    const percentage =
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

                                            <td className="p-4">
                                                <p className="font-medium">
                                                    {grade.student?.user?.name ||
                                                        "Unknown"}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {grade.student?.rollNumber ||
                                                        "N/A"}
                                                </p>
                                            </td>

                                            <td className="p-4">
                                                {grade.subject?.name ||
                                                    "Unknown"}
                                            </td>

                                            <td className="p-4 capitalize">
                                                {grade.examType}
                                            </td>

                                            <td className="p-4">
                                                {grade.marks} /{" "}
                                                {grade.maxMarks}
                                            </td>

                                            <td className="p-4">
                                                {percentage}%
                                            </td>

                                            <td className="p-4">
                                                <span className="font-bold">
                                                    {grade.grade}
                                                </span>
                                            </td>

                                            <td className="p-4">

                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                grade
                                                            )
                                                        }
                                                        className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                grade._id
                                                            )
                                                        }
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

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

export default FacultyGrades;