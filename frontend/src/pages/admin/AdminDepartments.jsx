import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: ""
    });

    const fetchDepartments = async () => {
        try {
            const response = await api.get("/departments");

            const data = response.data;

            setDepartments(
                Array.isArray(data)
                    ? data
                    : data.departments || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load departments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
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
            code: "",
            description: ""
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
            const departmentData = {
                name: form.name,
                code: form.code.toUpperCase(),
                description: form.description
            };

            if (editingId) {
                await api.put(
                    `/departments/${editingId}`,
                    departmentData
                );

                setMessage(
                    "Department updated successfully."
                );
            } else {
                await api.post(
                    "/departments",
                    departmentData
                );

                setMessage(
                    "Department created successfully."
                );
            }

            resetForm();
            await fetchDepartments();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save department."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (department) => {
        setEditingId(department._id);

        setForm({
            name: department.name || "",
            code: department.code || "",
            description: department.description || ""
        });

        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.delete(`/departments/${id}`);

            setMessage(
                "Department deleted successfully."
            );

            await fetchDepartments();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete department."
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading departments...
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
                        Departments
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage academic departments.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                    + Add Department
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
                                ? "Edit Department"
                                : "Add Department"}
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

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Department Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Computer Science and Engineering"
                                required
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Code */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Department Code
                            </label>

                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                placeholder="CSE"
                                required
                                className="w-full border rounded-lg px-4 py-3 uppercase"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Department description..."
                                rows="4"
                                className="w-full border rounded-lg px-4 py-3"
                            />
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
                                    ? "Update Department"
                                    : "Create Department"}
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Department Cards */}
            {departments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                    No departments found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {departments.map((department) => (
                        <div
                            key={department._id}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >

                            <div className="flex items-start justify-between">

                                <div>
                                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                        {department.code}
                                    </span>

                                    <h2 className="text-xl font-semibold text-gray-800 mt-4">
                                        {department.name}
                                    </h2>
                                </div>

                            </div>

                            <p className="text-gray-500 mt-3 min-h-12">
                                {department.description ||
                                    "No description available."}
                            </p>

                            <div className="flex justify-end gap-3 mt-6">

                                <button
                                    onClick={() =>
                                        handleEdit(
                                            department
                                        )
                                    }
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(
                                            department._id
                                        )
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default AdminDepartments;