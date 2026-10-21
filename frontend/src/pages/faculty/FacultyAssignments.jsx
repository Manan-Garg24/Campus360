import { useEffect, useState } from "react";
import api from "../../services/api";

const FacultyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        subject: "",
        dueDate: "",
        totalMarks: "",
    });

    const fetchData = async () => {
        try {
            const [assignmentResponse, subjectResponse] =
                await Promise.all([
                    api.get("/assignments/my"),
                    api.get("/subjects/my"),
                ]);

            const assignmentData = Array.isArray(assignmentResponse.data)
                ? assignmentResponse.data
                : assignmentResponse.data.assignments || [];

            const subjectData = Array.isArray(subjectResponse.data)
                ? subjectResponse.data
                : subjectResponse.data.subjects || [];

            setAssignments(assignmentData);
            setSubjects(subjectData);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load assignments."
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

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            subject: "",
            dueDate: "",
            totalMarks: "",
        });

        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setSaving(true);

        try {
            const assignmentData = {
                title: form.title,
                description: form.description,
                subject: form.subject,
                dueDate: form.dueDate,
                totalMarks: Number(form.totalMarks),
            };

            if (editingId) {
                await api.put(
                    `/assignments/${editingId}`,
                    assignmentData
                );

                setMessage("Assignment updated successfully.");
            } else {
                await api.post(
                    "/assignments",
                    assignmentData
                );

                setMessage("Assignment created successfully.");
            }

            resetForm();
            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save assignment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (assignment) => {
        setEditingId(assignment._id);

        setForm({
            title: assignment.title || "",
            description: assignment.description || "",
            subject: assignment.subject?._id || "",
            dueDate: assignment.dueDate
                ? new Date(assignment.dueDate)
                      .toISOString()
                      .split("T")[0]
                : "",
            totalMarks: assignment.totalMarks || "",
        });

        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this assignment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.delete(`/assignments/${id}`);

            setMessage("Assignment deleted successfully.");

            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete assignment."
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading assignments...
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
                        Assignments
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Create and manage your assignments.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                    + Create Assignment
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

                    <div className="flex items-center justify-between mb-6">

                        <h2 className="text-xl font-semibold">
                            {editingId
                                ? "Edit Assignment"
                                : "Create Assignment"}
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

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assignment Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Binary Tree Implementation"
                                required
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Enter assignment instructions..."
                                required
                                rows="4"
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Subject + Marks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Marks
                                </label>

                                <input
                                    type="number"
                                    name="totalMarks"
                                    value={form.totalMarks}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date
                            </label>

                            <input
                                type="date"
                                name="dueDate"
                                value={form.dueDate}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-3">

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
                                    ? "Update Assignment"
                                    : "Create Assignment"}
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Assignment List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {assignments.length === 0 ? (
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                        No assignments created yet.
                    </div>
                ) : (
                    assignments.map((assignment) => {

                        const dueDate = new Date(
                            assignment.dueDate
                        );

                        const isOverdue =
                            dueDate < new Date();

                        return (
                            <div
                                key={assignment._id}
                                className="bg-white rounded-xl shadow-sm p-6"
                            >

                                {/* Title */}
                                <div className="flex items-start justify-between gap-4">

                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {assignment.title}
                                        </h2>

                                        <p className="text-blue-600 text-sm mt-1">
                                            {assignment.subject?.name ||
                                                "Unknown Subject"}
                                            {" "}
                                            {assignment.subject?.code &&
                                                `(${assignment.subject.code})`}
                                        </p>
                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            isOverdue
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {isOverdue
                                            ? "Overdue"
                                            : "Upcoming"}
                                    </span>

                                </div>

                                {/* Description */}
                                <p className="text-gray-600 mt-4">
                                    {assignment.description}
                                </p>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4 mt-6">

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500">
                                            Due Date
                                        </p>

                                        <p className="font-semibold mt-1">
                                            {dueDate.toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500">
                                            Total Marks
                                        </p>

                                        <p className="font-semibold mt-1">
                                            {assignment.totalMarks}
                                        </p>
                                    </div>

                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 mt-6">

                                    <button
                                        onClick={() =>
                                            handleEdit(assignment)
                                        }
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                assignment._id
                                            )
                                        }
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        );
                    })
                )}

            </div>

        </div>
    );
};

export default FacultyAssignments;