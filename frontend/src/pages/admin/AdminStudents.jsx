import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        department: "",
        semester: "",
        section: "",
        enrollmentYear: ""
    });

    const fetchData = async () => {
        try {
            const [studentResponse, departmentResponse] =
                await Promise.all([
                    api.get("/students"),
                    api.get("/departments")
                ]);

            const studentData = Array.isArray(
                studentResponse.data
            )
                ? studentResponse.data
                : studentResponse.data.students || [];

            const departmentData = Array.isArray(
                departmentResponse.data
            )
                ? departmentResponse.data
                : departmentResponse.data.departments || [];

            setStudents(studentData);
            setDepartments(departmentData);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load student data."
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
            [name]: value
        }));
    };

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            password: "",
            rollNumber: "",
            department: "",
            semester: "",
            section: "",
            enrollmentYear: ""
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
            const studentData = {
                name: form.name,
                email: form.email,
                rollNumber: form.rollNumber,
                department: form.department,
                semester: Number(form.semester),
                section: form.section,
                enrollmentYear: Number(
                    form.enrollmentYear
                )
            };

            // Password is required only when creating
            if (!editingId) {
                studentData.password = form.password;
            }

            // If editing and password is entered,
            // update it as well.
            if (
                editingId &&
                form.password.trim() !== ""
            ) {
                studentData.password = form.password;
            }

            if (editingId) {
                await api.put(
                    `/students/${editingId}`,
                    studentData
                );

                setMessage(
                    "Student updated successfully."
                );
            } else {
                await api.post(
                    "/students",
                    studentData
                );

                setMessage(
                    "Student created successfully."
                );
            }

            resetForm();
            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save student."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (student) => {
        setEditingId(student._id);

        setForm({
            name: student.user?.name || "",
            email: student.user?.email || "",
            password: "",
            rollNumber: student.rollNumber || "",
            department: student.department?._id || "",
            semester: student.semester || "",
            section: student.section || "",
            enrollmentYear:
                student.enrollmentYear || ""
        });

        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.delete(`/students/${id}`);

            setMessage(
                "Student deleted successfully."
            );

            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete student."
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading students...
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
                        Students
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage student accounts and academic details.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                    + Add Student
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
                                ? "Edit Student"
                                : "Add Student"}
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

                        {/* Name + Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                        </div>

                        {/* Password + Roll Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {editingId
                                        ? "New Password (optional)"
                                        : "Password"}
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required={!editingId}
                                    minLength="6"
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Roll Number
                                </label>

                                <input
                                    type="text"
                                    name="rollNumber"
                                    value={form.rollNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                        </div>

                        {/* Department + Semester */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Department
                                </label>

                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                >
                                    <option value="">
                                        Select Department
                                    </option>

                                    {departments.map(
                                        (department) => (
                                            <option
                                                key={department._id}
                                                value={department._id}
                                            >
                                                {department.name} (
                                                {department.code})
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Semester
                                </label>

                                <select
                                    name="semester"
                                    value={form.semester}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                >
                                    <option value="">
                                        Select Semester
                                    </option>

                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                        (semester) => (
                                            <option
                                                key={semester}
                                                value={semester}
                                            >
                                                Semester {semester}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                        </div>

                        {/* Section + Enrollment Year */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Section
                                </label>

                                <input
                                    type="text"
                                    name="section"
                                    value={form.section}
                                    onChange={handleChange}
                                    placeholder="A"
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Enrollment Year
                                </label>

                                <input
                                    type="number"
                                    name="enrollmentYear"
                                    value={form.enrollmentYear}
                                    onChange={handleChange}
                                    min="2000"
                                    max="2100"
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

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
                                    ? "Update Student"
                                    : "Create Student"}
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Student Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                <div className="p-6 border-b flex justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Student Records
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {students.length} student
                            {students.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
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
                                        Department
                                    </th>

                                    <th className="text-left p-4">
                                        Semester
                                    </th>

                                    <th className="text-left p-4">
                                        Section
                                    </th>

                                    <th className="text-left p-4">
                                        Enrollment
                                    </th>

                                    <th className="text-center p-4">
                                        Actions
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
                                            <p className="font-medium">
                                                {student.user?.name ||
                                                    "N/A"}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {student.user?.email ||
                                                    "N/A"}
                                            </p>
                                        </td>

                                        <td className="p-4">
                                            {student.department?.code ||
                                                student.department?.name ||
                                                "N/A"}
                                        </td>

                                        <td className="p-4">
                                            {student.semester}
                                        </td>

                                        <td className="p-4">
                                            {student.section}
                                        </td>

                                        <td className="p-4">
                                            {student.enrollmentYear}
                                        </td>

                                        <td className="p-4">

                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            student
                                                        )
                                                    }
                                                    className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            student._id
                                                        )
                                                    }
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>

                                            </div>

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

export default AdminStudents;