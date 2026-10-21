import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminFaculty = () => {
    const [faculty, setFaculty] = useState([]);
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
        employeeId: "",
        department: "",
        designation: ""
    });

    const fetchData = async () => {
        try {
            const [facultyResponse, departmentResponse] =
                await Promise.all([
                    api.get("/faculty"),
                    api.get("/departments")
                ]);

            const facultyData = Array.isArray(
                facultyResponse.data
            )
                ? facultyResponse.data
                : facultyResponse.data.faculty || [];

            const departmentData = Array.isArray(
                departmentResponse.data
            )
                ? departmentResponse.data
                : departmentResponse.data.departments || [];

            setFaculty(facultyData);
            setDepartments(departmentData);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load faculty data."
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
            employeeId: "",
            department: "",
            designation: ""
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
            const facultyData = {
                name: form.name,
                email: form.email,
                employeeId: form.employeeId,
                department: form.department,
                designation: form.designation
            };

            if (!editingId) {
                facultyData.password = form.password;
            }

            if (
                editingId &&
                form.password.trim() !== ""
            ) {
                facultyData.password = form.password;
            }

            if (editingId) {
                await api.put(
                    `/faculty/${editingId}`,
                    facultyData
                );

                setMessage(
                    "Faculty updated successfully."
                );
            } else {
                await api.post(
                    "/faculty",
                    facultyData
                );

                setMessage(
                    "Faculty created successfully."
                );
            }

            resetForm();
            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save faculty."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (member) => {
        setEditingId(member._id);

        setForm({
            name: member.user?.name || "",
            email: member.user?.email || "",
            password: "",
            employeeId: member.employeeId || "",
            department:
                member.department?._id || "",
            designation:
                member.designation || ""
        });

        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this faculty member?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.delete(`/faculty/${id}`);

            setMessage(
                "Faculty deleted successfully."
            );

            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete faculty."
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading faculty...
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
                        Faculty
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage faculty accounts and profiles.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                    + Add Faculty
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
                                ? "Edit Faculty"
                                : "Add Faculty"}
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

                        {/* Password + Employee ID */}
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
                                    Employee ID
                                </label>

                                <input
                                    type="text"
                                    name="employeeId"
                                    value={form.employeeId}
                                    onChange={handleChange}
                                    placeholder="FAC002"
                                    required
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                        </div>

                        {/* Department */}
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

                        {/* Designation */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Designation
                            </label>

                            <input
                                type="text"
                                name="designation"
                                value={form.designation}
                                onChange={handleChange}
                                placeholder="Assistant Professor"
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
                                    ? "Update Faculty"
                                    : "Create Faculty"}
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Faculty Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Faculty Records
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        {faculty.length} faculty member
                        {faculty.length !== 1
                            ? "s"
                            : ""}
                    </p>
                </div>

                {faculty.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No faculty found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4">
                                        Employee ID
                                    </th>

                                    <th className="text-left p-4">
                                        Faculty
                                    </th>

                                    <th className="text-left p-4">
                                        Department
                                    </th>

                                    <th className="text-left p-4">
                                        Designation
                                    </th>

                                    <th className="text-center p-4">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {faculty.map((member) => (
                                    <tr
                                        key={member._id}
                                        className="border-t hover:bg-gray-50"
                                    >

                                        <td className="p-4 font-medium">
                                            {member.employeeId}
                                        </td>

                                        <td className="p-4">
                                            <p className="font-medium">
                                                {member.user?.name ||
                                                    "N/A"}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {member.user?.email ||
                                                    "N/A"}
                                            </p>
                                        </td>

                                        <td className="p-4">
                                            {member.department?.code ||
                                                member.department?.name ||
                                                "N/A"}
                                        </td>

                                        <td className="p-4">
                                            {member.designation}
                                        </td>

                                        <td className="p-4">

                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            member
                                                        )
                                                    }
                                                    className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            member._id
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

export default AdminFaculty;